import { BleManager, Device, Subscription, BleError } from 'react-native-ble-plx';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import {
  TORP_BLE,
  TorpCommand,
  TorpRealtimeData,
  TorpConfig,
  PowerMap,
  RideMode,
  buildFrame,
  buildConfigFrame,
  buildPowerMapFrame,
  parseFrame,
  parseRealtimeData,
  parseConfig,
} from './TorpProtocol';

export type ConnectionStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error';

export interface SurronDevice {
  id: string;
  name: string;
  rssi: number;
}

type RealtimeCallback = (data: TorpRealtimeData) => void;
type StatusCallback = (status: ConnectionStatus) => void;

class BluetoothService {
  private manager: BleManager;
  private connectedDevice: Device | null = null;
  private realtimeSubscription: Subscription | null = null;
  private responseQueue: Map<TorpCommand, (data: Uint8Array) => void> = new Map();
  private realtimeCallbacks: Set<RealtimeCallback> = new Set();
  private statusCallbacks: Set<StatusCallback> = new Set();
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private _status: ConnectionStatus = 'disconnected';
  private receiveBuffer: number[] = [];

  constructor() {
    this.manager = new BleManager();
  }

  private setStatus(status: ConnectionStatus) {
    this._status = status;
    this.statusCallbacks.forEach(cb => cb(status));
  }

  get status(): ConnectionStatus {
    return this._status;
  }

  get isConnected(): boolean {
    return this._status === 'connected' && this.connectedDevice !== null;
  }

  onStatus(cb: StatusCallback): () => void {
    this.statusCallbacks.add(cb);
    return () => this.statusCallbacks.delete(cb);
  }

  onRealtimeData(cb: RealtimeCallback): () => void {
    this.realtimeCallbacks.add(cb);
    return () => this.realtimeCallbacks.delete(cb);
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const { PermissionsAndroid } = require('react-native');
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(granted).every(v => v === PermissionsAndroid.RESULTS.GRANTED);
    }
    return true;
  }

  scanForDevices(
    onDeviceFound: (device: SurronDevice) => void,
    onError?: (error: BleError) => void
  ): () => void {
    this.setStatus('scanning');
    const found = new Set<string>();

    this.manager.startDeviceScan(
      [TORP_BLE.SERVICE_UUID],
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          this.setStatus('error');
          onError?.(error);
          return;
        }
        if (device && device.name?.startsWith(TORP_BLE.DEVICE_NAME_PREFIX) && !found.has(device.id)) {
          found.add(device.id);
          onDeviceFound({
            id: device.id,
            name: device.name ?? 'TORP 500',
            rssi: device.rssi ?? -100,
          });
        }
      }
    );

    return () => {
      this.manager.stopDeviceScan();
      if (this._status === 'scanning') this.setStatus('disconnected');
    };
  }

  async connect(deviceId: string): Promise<void> {
    this.manager.stopDeviceScan();
    this.setStatus('connecting');

    try {
      const device = await this.manager.connectToDevice(deviceId, {
        autoConnect: false,
        requestMTU: 256,
      });

      await device.discoverAllServicesAndCharacteristics();
      this.connectedDevice = device;

      this.realtimeSubscription = device.monitorCharacteristicForService(
        TORP_BLE.SERVICE_UUID,
        TORP_BLE.RX_CHAR_UUID,
        (error, characteristic) => {
          if (error || !characteristic?.value) return;
          const bytes = Buffer.from(characteristic.value, 'base64');
          this.handleIncoming(new Uint8Array(bytes));
        }
      );

      device.onDisconnected(() => {
        this.cleanup();
        this.setStatus('disconnected');
      });

      this.setStatus('connected');
      this.startPolling();
    } catch (e) {
      this.setStatus('error');
      throw e;
    }
  }

  private handleIncoming(bytes: Uint8Array) {
    this.receiveBuffer.push(...Array.from(bytes));

    while (this.receiveBuffer.length >= 4) {
      const sofIdx = this.receiveBuffer.indexOf(0xAA);
      if (sofIdx < 0) { this.receiveBuffer = []; return; }
      if (sofIdx > 0) this.receiveBuffer = this.receiveBuffer.slice(sofIdx);

      if (this.receiveBuffer.length < 4) return;
      const len = this.receiveBuffer[2];
      const frameLen = 4 + len;
      if (this.receiveBuffer.length < frameLen) return;

      const frameBytes = new Uint8Array(this.receiveBuffer.slice(0, frameLen));
      this.receiveBuffer = this.receiveBuffer.slice(frameLen);

      const parsed = parseFrame(frameBytes);
      if (!parsed) continue;

      if (parsed.cmd === TorpCommand.GET_REALTIME) {
        const data = parseRealtimeData(parsed.data);
        this.realtimeCallbacks.forEach(cb => cb(data));
      } else {
        const resolver = this.responseQueue.get(parsed.cmd);
        if (resolver) {
          this.responseQueue.delete(parsed.cmd);
          resolver(parsed.data);
        }
      }
    }
  }

  private async sendFrame(frame: Uint8Array): Promise<void> {
    if (!this.connectedDevice) throw new Error('Not connected');
    const b64 = Buffer.from(frame).toString('base64');
    await this.connectedDevice.writeCharacteristicWithResponseForService(
      TORP_BLE.SERVICE_UUID,
      TORP_BLE.TX_CHAR_UUID,
      b64
    );
  }

  private sendAndWait(cmd: TorpCommand, data: number[] = [], timeoutMs = 3000): Promise<Uint8Array> {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        this.responseQueue.delete(cmd);
        reject(new Error(`Timeout waiting for response to cmd 0x${cmd.toString(16)}`));
      }, timeoutMs);

      this.responseQueue.set(cmd, (responseData) => {
        clearTimeout(timeout);
        resolve(responseData);
      });

      try {
        await this.sendFrame(buildFrame(cmd, data));
      } catch (e) {
        clearTimeout(timeout);
        this.responseQueue.delete(cmd);
        reject(e);
      }
    });
  }

  async getConfig(): Promise<TorpConfig> {
    const data = await this.sendAndWait(TorpCommand.GET_CONFIG);
    return parseConfig(data);
  }

  async setConfig(config: TorpConfig): Promise<void> {
    await this.sendFrame(buildConfigFrame(config));
  }

  async setRideMode(mode: RideMode): Promise<void> {
    await this.sendFrame(buildFrame(TorpCommand.SET_RIDE_MODE, [mode]));
  }

  async getPowerMap(): Promise<PowerMap> {
    const data = await this.sendAndWait(TorpCommand.GET_POWER_MAP);
    return { points: Array.from(data.slice(0, 10)) };
  }

  async setPowerMap(map: PowerMap): Promise<void> {
    await this.sendFrame(buildPowerMapFrame(map));
  }

  async resetTrip(): Promise<void> {
    await this.sendFrame(buildFrame(TorpCommand.RESET_TRIP));
  }

  async getFirmwareVersion(): Promise<string> {
    const data = await this.sendAndWait(TorpCommand.GET_FIRMWARE_VER);
    return `${data[0]}.${data[1]}.${data[2]}`;
  }

  async ping(): Promise<boolean> {
    try {
      await this.sendAndWait(TorpCommand.PING, [], 1000);
      return true;
    } catch {
      return false;
    }
  }

  private startPolling() {
    this.pollingInterval = setInterval(async () => {
      if (!this.isConnected) return;
      try {
        await this.sendFrame(buildFrame(TorpCommand.GET_REALTIME));
      } catch {
        // ignore polling errors
      }
    }, 500);
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await this.connectedDevice.cancelConnection();
      } catch {}
    }
    this.cleanup();
    this.setStatus('disconnected');
  }

  private cleanup() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.realtimeSubscription?.remove();
    this.realtimeSubscription = null;
    this.connectedDevice = null;
    this.responseQueue.clear();
    this.receiveBuffer = [];
  }

  destroy() {
    this.cleanup();
    this.manager.destroy();
  }
}

export const bluetoothService = new BluetoothService();
