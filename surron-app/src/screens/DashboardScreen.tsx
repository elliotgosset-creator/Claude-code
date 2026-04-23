import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { bluetoothService } from '../services/BluetoothService';
import { TorpRealtimeData, RideMode } from '../services/TorpProtocol';
import ArcGauge from '../components/ArcGauge';
import BatteryBar from '../components/BatteryBar';

const { width } = Dimensions.get('window');

const MODE_COLORS: Record<RideMode, string> = {
  [RideMode.ECO]:    Colors.modeEco,
  [RideMode.TRAIL]:  Colors.modeTrail,
  [RideMode.ENDURO]: Colors.modeEnduro,
  [RideMode.RACE]:   Colors.modeRace,
  [RideMode.CUSTOM]: Colors.modeCustom,
};

const MODE_NAMES: Record<RideMode, string> = {
  [RideMode.ECO]:    'ECO',
  [RideMode.TRAIL]:  'TRAIL',
  [RideMode.ENDURO]: 'ENDURO',
  [RideMode.RACE]:   'RACE',
  [RideMode.CUSTOM]: 'CUSTOM',
};

const MOCK_DATA: TorpRealtimeData = {
  batteryVoltage: 67.2,
  batteryCurrent: 0,
  batteryPercent: 87,
  motorSpeed: 0,
  vehicleSpeed: 0,
  motorTemp: 24,
  controllerTemp: 28,
  throttlePosition: 0,
  powerOutput: 0,
  regenCurrent: 0,
  odometer: 412.5,
  tripDistance: 0,
  tripTime: 0,
};

function StatCard({
  label, value, unit, icon, color = Colors.primary, warning = false,
}: {
  label: string; value: string; unit: string; icon: string; color?: string; warning?: boolean;
}) {
  return (
    <View style={[styles.statCard, warning && { borderColor: Colors.warning }]}>
      <MaterialCommunityIcons name={icon as any} size={18} color={warning ? Colors.warning : color} />
      <Text style={[styles.statValue, { color: warning ? Colors.warning : color }]}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

interface Props {
  onDisconnect: () => void;
  currentMode: RideMode;
}

export default function DashboardScreen({ onDisconnect, currentMode }: Props) {
  const [data, setData] = useState<TorpRealtimeData>(MOCK_DATA);
  const [connected, setConnected] = useState(true);
  const blinkAnim = useRef(new Animated.Value(1)).current;

  const motorWarning = data.motorTemp > 80;
  const ctrlWarning = data.controllerTemp > 70;

  useEffect(() => {
    const unsub = bluetoothService.onRealtimeData(setData);
    const unsubStatus = bluetoothService.onStatus((s) => {
      if (s === 'disconnected') setConnected(false);
    });
    return () => { unsub(); unsubStatus(); };
  }, []);

  // Blink when disconnected
  useEffect(() => {
    if (!connected) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    } else {
      blinkAnim.setValue(1);
    }
  }, [connected]);

  const modeColor = MODE_COLORS[currentMode];

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#0A0A0F']} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <Animated.View style={[styles.dot, { opacity: blinkAnim, backgroundColor: connected ? Colors.success : Colors.danger }]} />
            <Text style={styles.connLabel}>{connected ? 'CONNECTÉ' : 'DÉCONNECTÉ'}</Text>
          </View>
          <View style={[styles.modeChip, { borderColor: modeColor }]}>
            <Text style={[styles.modeChipText, { color: modeColor }]}>{MODE_NAMES[currentMode]}</Text>
          </View>
          <TouchableOpacity onPress={onDisconnect} style={styles.disconnectBtn}>
            <MaterialCommunityIcons name="bluetooth-off" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Main speed display */}
        <View style={styles.speedSection}>
          <LinearGradient
            colors={[`${modeColor}18`, `${modeColor}06`]}
            style={styles.speedCard}
          >
            <Text style={styles.speedLabel}>VITESSE</Text>
            <View style={styles.speedRow}>
              <Text style={[styles.speedValue, { color: modeColor }]}>
                {Math.round(data.vehicleSpeed)}
              </Text>
              <Text style={styles.speedUnit}>km/h</Text>
            </View>

            {/* Throttle position bar */}
            <View style={styles.throttleRow}>
              <Text style={styles.throttleLabel}>ACCÉLÉRATEUR</Text>
              <Text style={[styles.throttleLabel, { color: modeColor }]}>
                {data.throttlePosition}%
              </Text>
            </View>
            <View style={styles.throttleTrack}>
              <View
                style={[
                  styles.throttleFill,
                  { width: `${data.throttlePosition}%`, backgroundColor: modeColor },
                ]}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Power & RPM gauges */}
        <View style={styles.gaugesRow}>
          <ArcGauge
            value={data.powerOutput / 1000}
            max={5}
            size={150}
            label="PUISSANCE"
            unit="kW"
            color={modeColor}
            decimals={1}
          />
          <ArcGauge
            value={data.motorSpeed}
            max={6000}
            size={150}
            label="MOTEUR"
            unit="RPM"
            color={Colors.primary}
          />
        </View>

        {/* Battery */}
        <View style={styles.section}>
          <BatteryBar percent={data.batteryPercent} voltage={data.batteryVoltage} />
        </View>

        {/* Current */}
        <View style={styles.section}>
          <View style={styles.currentRow}>
            <View style={styles.currentItem}>
              <Text style={styles.statLabel}>COURANT</Text>
              <Text style={[styles.currentValue, { color: data.batteryCurrent > 0 ? Colors.accent : Colors.success }]}>
                {Math.abs(data.batteryCurrent).toFixed(1)}
                <Text style={styles.statUnit}> A</Text>
              </Text>
              <Text style={[styles.statUnit, { marginTop: 2 }]}>
                {data.batteryCurrent > 0 ? 'DÉCHARGE' : data.batteryCurrent < 0 ? 'REGEN' : 'REPOS'}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.currentItem}>
              <Text style={styles.statLabel}>PUISSANCE</Text>
              <Text style={[styles.currentValue, { color: modeColor }]}>
                {(data.powerOutput / 1000).toFixed(2)}
                <Text style={styles.statUnit}> kW</Text>
              </Text>
              <Text style={[styles.statUnit, { marginTop: 2 }]}>INSTANTANÉ</Text>
            </View>
          </View>
        </View>

        {/* Temperatures */}
        <View style={styles.statsGrid}>
          <StatCard
            label="MOTEUR"
            value={data.motorTemp.toFixed(0)}
            unit="°C"
            icon="thermometer"
            color={motorWarning ? Colors.warning : Colors.primary}
            warning={motorWarning}
          />
          <StatCard
            label="CONTRÔLEUR"
            value={data.controllerTemp.toFixed(0)}
            unit="°C"
            icon="thermometer-lines"
            color={ctrlWarning ? Colors.warning : Colors.primary}
            warning={ctrlWarning}
          />
          <StatCard
            label="TRAJET"
            value={data.tripDistance.toFixed(1)}
            unit="km"
            icon="map-marker-distance"
          />
          <StatCard
            label="ODOMÈTRE"
            value={data.odometer.toFixed(0)}
            unit="km"
            icon="counter"
            color={Colors.textSecondary}
          />
          <StatCard
            label="DURÉE"
            value={formatTime(data.tripTime)}
            unit=""
            icon="timer-outline"
            color={Colors.textSecondary}
          />
          <StatCard
            label="REGEN"
            value={data.regenCurrent.toFixed(1)}
            unit="A"
            icon="battery-charging"
            color={Colors.success}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xl },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingTop: Spacing.sm,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  connLabel: { ...Typography.label, color: Colors.textMuted },
  modeChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
  },
  modeChipText: { ...Typography.label, fontWeight: '700' },
  disconnectBtn: { padding: 6 },

  speedSection: { marginBottom: Spacing.md },
  speedCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  speedLabel: { ...Typography.label, color: Colors.textMuted, marginBottom: 4 },
  speedRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  speedValue: { fontSize: 80, fontWeight: '800', letterSpacing: -4, lineHeight: 84 },
  speedUnit: { ...Typography.h2, color: Colors.textSecondary, marginBottom: 10 },

  throttleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    marginBottom: 6,
  },
  throttleLabel: { ...Typography.label, color: Colors.textMuted },
  throttleTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  throttleFill: { height: '100%', borderRadius: 3 },

  gaugesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  currentRow: { flexDirection: 'row', alignItems: 'center' },
  currentItem: { flex: 1, alignItems: 'center' },
  currentValue: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  separator: { width: 1, height: 50, backgroundColor: Colors.border },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    width: (width - Spacing.md * 2 - Spacing.sm * 2) / 3,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 2,
  },
  statValue: { ...Typography.h3, fontWeight: '700' },
  statUnit: { ...Typography.caption, color: Colors.textMuted },
  statLabel: { ...Typography.label, color: Colors.textMuted, fontSize: 9 },
});
