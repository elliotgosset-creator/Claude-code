// TORP 500 BLE Protocol Implementation
// Service: Nordic UART Service (NUS)
// Communication via structured binary frames

export const TORP_BLE = {
  SERVICE_UUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  TX_CHAR_UUID: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // Write to controller
  RX_CHAR_UUID: '6e400003-b5a3-f393-e0a9-e50e24dcca9e', // Notify from controller
  DEVICE_NAME_PREFIX: 'TORP',
};

// Frame structure: [SOF:1] [CMD:1] [LEN:1] [DATA:N] [CRC:1]
const SOF = 0xAA;

export enum TorpCommand {
  GET_STATUS       = 0x01,
  GET_REALTIME     = 0x02,
  GET_CONFIG       = 0x03,
  SET_CONFIG       = 0x04,
  GET_RIDE_MODE    = 0x05,
  SET_RIDE_MODE    = 0x06,
  GET_POWER_MAP    = 0x07,
  SET_POWER_MAP    = 0x08,
  GET_TRIP_DATA    = 0x09,
  RESET_TRIP       = 0x0A,
  GET_FIRMWARE_VER = 0x0B,
  SET_THROTTLE_CAL = 0x0C,
  GET_ERRORS       = 0x0D,
  CLEAR_ERRORS     = 0x0E,
  PING             = 0xFF,
}

export enum RideMode {
  ECO    = 0x01,
  TRAIL  = 0x02,
  ENDURO = 0x03,
  RACE   = 0x04,
  CUSTOM = 0x05,
}

export interface TorpRealtimeData {
  batteryVoltage: number;     // V (0.1V resolution)
  batteryCurrent: number;     // A (0.1A resolution)
  batteryPercent: number;     // 0-100%
  motorSpeed: number;         // RPM
  vehicleSpeed: number;       // km/h
  motorTemp: number;          // °C
  controllerTemp: number;     // °C
  throttlePosition: number;   // 0-100%
  powerOutput: number;        // W
  regenCurrent: number;       // A
  odometer: number;           // km
  tripDistance: number;       // km
  tripTime: number;           // seconds
}

export interface TorpConfig {
  maxPower: number;           // 0-100% of rated power
  maxSpeed: number;           // km/h limit (0 = unlimited)
  regenStrength: number;      // 0-10
  tractionControl: number;    // 0-10 (0 = off)
  startupBehavior: number;    // 0=soft, 1=normal, 2=aggressive
  batteryLowProtect: number;  // cutoff voltage * 10
  motorTempLimit: number;     // °C
  controllerTempLimit: number; // °C
  currentRideMode: RideMode;
}

export interface PowerMap {
  points: number[];  // 10 points, each 0-100 representing output at each throttle step
}

function crc8(data: number[]): number {
  let crc = 0;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x80) crc = ((crc << 1) ^ 0x07) & 0xFF;
      else crc = (crc << 1) & 0xFF;
    }
  }
  return crc;
}

export function buildFrame(cmd: TorpCommand, data: number[] = []): Uint8Array {
  const payload = [SOF, cmd, data.length, ...data];
  const crc = crc8(payload);
  return new Uint8Array([...payload, crc]);
}

export function parseFrame(bytes: Uint8Array): { cmd: TorpCommand; data: Uint8Array } | null {
  if (bytes.length < 4) return null;
  if (bytes[0] !== SOF) return null;
  const cmd = bytes[1] as TorpCommand;
  const len = bytes[2];
  if (bytes.length < 4 + len) return null;
  const data = bytes.slice(3, 3 + len);
  const receivedCrc = bytes[3 + len];
  const computed = crc8(Array.from(bytes.slice(0, 3 + len)));
  if (receivedCrc !== computed) return null;
  return { cmd, data };
}

export function parseRealtimeData(data: Uint8Array): TorpRealtimeData {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return {
    batteryVoltage:    view.getUint16(0, true) / 10,
    batteryCurrent:    view.getInt16(2, true) / 10,
    batteryPercent:    view.getUint8(4),
    motorSpeed:        view.getUint16(5, true),
    vehicleSpeed:      view.getUint16(7, true) / 10,
    motorTemp:         view.getInt16(9, true) / 10,
    controllerTemp:    view.getInt16(11, true) / 10,
    throttlePosition:  view.getUint8(13),
    powerOutput:       view.getUint16(14, true),
    regenCurrent:      view.getUint16(16, true) / 10,
    odometer:          view.getUint32(18, true) / 10,
    tripDistance:      view.getUint32(22, true) / 100,
    tripTime:          view.getUint32(26, true),
  };
}

export function parseConfig(data: Uint8Array): TorpConfig {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return {
    maxPower:             view.getUint8(0),
    maxSpeed:             view.getUint8(1),
    regenStrength:        view.getUint8(2),
    tractionControl:      view.getUint8(3),
    startupBehavior:      view.getUint8(4),
    batteryLowProtect:    view.getUint16(5, true) / 10,
    motorTempLimit:       view.getUint8(7),
    controllerTempLimit:  view.getUint8(8),
    currentRideMode:      view.getUint8(9) as RideMode,
  };
}

export function buildConfigFrame(config: TorpConfig): Uint8Array {
  const data = [
    config.maxPower,
    config.maxSpeed,
    config.regenStrength,
    config.tractionControl,
    config.startupBehavior,
    Math.round(config.batteryLowProtect * 10) & 0xFF,
    (Math.round(config.batteryLowProtect * 10) >> 8) & 0xFF,
    config.motorTempLimit,
    config.controllerTempLimit,
    config.currentRideMode,
  ];
  return buildFrame(TorpCommand.SET_CONFIG, data);
}

export function buildPowerMapFrame(map: PowerMap): Uint8Array {
  return buildFrame(TorpCommand.SET_POWER_MAP, map.points.slice(0, 10));
}

export const DEFAULT_POWER_MAPS: Record<RideMode, PowerMap> = {
  [RideMode.ECO]: {
    points: [0, 8, 18, 28, 38, 48, 56, 62, 68, 72],
  },
  [RideMode.TRAIL]: {
    points: [0, 12, 25, 38, 50, 62, 72, 80, 86, 90],
  },
  [RideMode.ENDURO]: {
    points: [0, 18, 35, 52, 65, 76, 84, 90, 95, 98],
  },
  [RideMode.RACE]: {
    points: [0, 25, 50, 70, 82, 90, 95, 98, 99, 100],
  },
  [RideMode.CUSTOM]: {
    points: [0, 15, 30, 45, 60, 72, 82, 90, 96, 100],
  },
};

export const DEFAULT_CONFIGS: Record<RideMode, Partial<TorpConfig>> = {
  [RideMode.ECO]:    { maxPower: 40, maxSpeed: 45, regenStrength: 8, tractionControl: 8 },
  [RideMode.TRAIL]:  { maxPower: 70, maxSpeed: 0,  regenStrength: 5, tractionControl: 5 },
  [RideMode.ENDURO]: { maxPower: 90, maxSpeed: 0,  regenStrength: 3, tractionControl: 3 },
  [RideMode.RACE]:   { maxPower: 100, maxSpeed: 0, regenStrength: 1, tractionControl: 1 },
  [RideMode.CUSTOM]: { maxPower: 80, maxSpeed: 0,  regenStrength: 4, tractionControl: 4 },
};
