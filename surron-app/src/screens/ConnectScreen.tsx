import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { bluetoothService, SurronDevice, ConnectionStatus } from '../services/BluetoothService';

const rssiToStrength = (rssi: number): number => {
  if (rssi >= -60) return 4;
  if (rssi >= -70) return 3;
  if (rssi >= -80) return 2;
  return 1;
};

const SignalIcon = ({ rssi }: { rssi: number }) => {
  const strength = rssiToStrength(rssi);
  return (
    <View style={styles.signal}>
      {[1, 2, 3, 4].map(i => (
        <View
          key={i}
          style={[
            styles.signalBar,
            { height: 4 + i * 3 },
            i <= strength ? { backgroundColor: Colors.primary } : { backgroundColor: Colors.border },
          ]}
        />
      ))}
    </View>
  );
};

const PulseRing = ({ active }: { active: boolean }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!active) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 2.2, duration: 1200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [active]);

  if (!active) return null;
  return (
    <Animated.View
      style={[styles.pulseRing, { transform: [{ scale }], opacity }]}
    />
  );
};

interface Props {
  onConnected: () => void;
}

export default function ConnectScreen({ onConnected }: Props) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [devices, setDevices] = useState<SurronDevice[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const stopScan = useRef<(() => void) | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    const unsub = bluetoothService.onStatus(setStatus);
    return () => {
      unsub();
      stopScan.current?.();
    };
  }, []);

  const startScan = async () => {
    const ok = await bluetoothService.requestPermissions();
    if (!ok) {
      Alert.alert(
        'Permissions requises',
        'Les permissions Bluetooth et localisation sont nécessaires pour trouver votre TORP 500.',
        [{ text: 'OK' }]
      );
      return;
    }
    setDevices([]);
    stopScan.current = bluetoothService.scanForDevices(
      (device) => setDevices(prev => [...prev.filter(d => d.id !== device.id), device]),
      (err) => Alert.alert('Erreur Bluetooth', err.message)
    );
  };

  const connectTo = async (device: SurronDevice) => {
    setConnectingId(device.id);
    stopScan.current?.();
    try {
      await bluetoothService.connect(device.id);
      onConnected();
    } catch (e: any) {
      setConnectingId(null);
      Alert.alert('Connexion échouée', e.message ?? 'Impossible de se connecter au TORP 500');
    }
  };

  const isScanning = status === 'scanning';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A1A', '#0A0A0F']}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>SURRON</Text>
          <Text style={styles.subtitle}>TORP 500 CONTROLLER</Text>
        </View>

        {/* Bluetooth icon with pulse */}
        <View style={styles.iconContainer}>
          <PulseRing active={isScanning} />
          <LinearGradient
            colors={isScanning ? ['#00E5FF20', '#00E5FF08'] : ['#1A1A2A', '#12121A']}
            style={styles.iconCircle}
          >
            <MaterialCommunityIcons
              name="bluetooth"
              size={48}
              color={isScanning ? Colors.primary : Colors.textMuted}
            />
          </LinearGradient>
        </View>

        {/* Status text */}
        <Text style={styles.statusText}>
          {status === 'scanning' ? 'Recherche en cours...' :
           status === 'connecting' ? 'Connexion...' :
           status === 'connected' ? 'Connecté !' :
           status === 'error' ? 'Erreur Bluetooth' :
           'Prêt à connecter'}
        </Text>

        {/* Device list */}
        {devices.length > 0 && (
          <View style={styles.deviceList}>
            <Text style={styles.sectionLabel}>APPAREILS TROUVÉS</Text>
            <FlatList
              data={devices}
              keyExtractor={(d) => d.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.deviceCard,
                    connectingId === item.id && styles.deviceCardConnecting,
                  ]}
                  onPress={() => connectTo(item)}
                  disabled={connectingId !== null}
                >
                  <View style={styles.deviceInfo}>
                    <MaterialCommunityIcons
                      name="chip"
                      size={22}
                      color={Colors.primary}
                      style={{ marginRight: 12 }}
                    />
                    <View>
                      <Text style={styles.deviceName}>{item.name}</Text>
                      <Text style={styles.deviceId}>{item.id.slice(0, 17)}</Text>
                    </View>
                  </View>
                  <View style={styles.deviceRight}>
                    <SignalIcon rssi={item.rssi} />
                    {connectingId === item.id ? (
                      <Text style={styles.connectingText}>Connexion...</Text>
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {devices.length === 0 && status !== 'scanning' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Assurez-vous que votre Surron est allumée{'\n'}et le TORP 500 en mode BLE
            </Text>
          </View>
        )}

        {/* Scan button */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={isScanning ? () => { stopScan.current?.(); } : startScan}
          disabled={status === 'connecting'}
        >
          <LinearGradient
            colors={isScanning ? ['#FF3B3B20', '#FF3B3B10'] : ['#00E5FF20', '#00E5FF08']}
            style={styles.scanButtonGradient}
          >
            <MaterialCommunityIcons
              name={isScanning ? 'stop' : 'bluetooth-connect'}
              size={20}
              color={isScanning ? Colors.danger : Colors.primary}
            />
            <Text style={[styles.scanButtonText, isScanning && { color: Colors.danger }]}>
              {isScanning ? 'Arrêter' : 'Rechercher'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Info */}
        <Text style={styles.hint}>
          {'Le TORP 500 doit être visible (mode BLE actif)\nConsultez le manuel TORP pour l\'activer'}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  brand: {
    ...Typography.h1,
    color: Colors.textPrimary,
    letterSpacing: 8,
    fontSize: 36,
  },
  subtitle: {
    ...Typography.label,
    color: Colors.primary,
    marginTop: 4,
  },
  iconContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    alignSelf: 'flex-start',
  },
  deviceList: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deviceCardConnecting: {
    borderColor: Colors.primary,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  deviceId: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  deviceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signal: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    marginRight: 4,
  },
  signalBar: {
    width: 3,
    borderRadius: 1,
    backgroundColor: Colors.border,
  },
  connectingText: {
    ...Typography.caption,
    color: Colors.primary,
  },
  emptyState: {
    marginVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  scanButton: {
    width: '100%',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  scanButtonText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.primary,
    fontSize: 16,
  },
  hint: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
