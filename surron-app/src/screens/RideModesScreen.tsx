import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { bluetoothService } from '../services/BluetoothService';
import { RideMode, DEFAULT_CONFIGS } from '../services/TorpProtocol';

const { width } = Dimensions.get('window');

const MODES = [
  {
    mode: RideMode.ECO,
    name: 'ECO',
    color: Colors.modeEco,
    icon: 'leaf',
    desc: 'Économie maximale',
    power: 40,
    speed: 45,
    regen: 8,
    traction: 8,
    features: ['Puissance limitée à 40%', 'Vitesse max 45 km/h', 'Regen fort', 'Traction control max'],
  },
  {
    mode: RideMode.TRAIL,
    name: 'TRAIL',
    color: Colors.modeTrail,
    icon: 'pine-tree',
    desc: 'Équilibre polyvalent',
    power: 70,
    speed: 0,
    regen: 5,
    traction: 5,
    features: ['Puissance 70%', 'Vitesse illimitée', 'Regen modéré', 'TC équilibré'],
  },
  {
    mode: RideMode.ENDURO,
    name: 'ENDURO',
    color: Colors.modeEnduro,
    icon: 'terrain',
    desc: 'Performance off-road',
    power: 90,
    speed: 0,
    regen: 3,
    traction: 3,
    features: ['Puissance 90%', 'Réponse directe', 'Regen léger', 'TC minimal'],
  },
  {
    mode: RideMode.RACE,
    name: 'RACE',
    color: Colors.modeRace,
    icon: 'flag-checkered',
    desc: 'Performance maximale',
    power: 100,
    speed: 0,
    regen: 1,
    traction: 1,
    features: ['Puissance 100%', 'Courbe agressive', 'Regen minimal', 'TC désactivé'],
  },
  {
    mode: RideMode.CUSTOM,
    name: 'CUSTOM',
    color: Colors.modeCustom,
    icon: 'tune',
    desc: 'Paramètres personnalisés',
    power: 80,
    speed: 0,
    regen: 4,
    traction: 4,
    features: ['Réglages personnalisés', 'Carte de puissance libre', 'Config avancée', 'Via onglet CARTE'],
  },
];

function ModeCard({
  item,
  isActive,
  onSelect,
}: {
  item: typeof MODES[0];
  isActive: boolean;
  onSelect: () => void;
}) {
  const PowerBar = ({ pct, color }: { pct: number; color: string }) => (
    <View style={barStyles.track}>
      <View style={[barStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );

  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.85}>
      <LinearGradient
        colors={isActive ? [`${item.color}22`, `${item.color}08`] : ['#12121A', '#0E0E16']}
        style={[styles.modeCard, isActive && { borderColor: item.color }]}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.iconBadge, { backgroundColor: `${item.color}20` }]}>
            <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
          </View>
          <View style={styles.cardTitles}>
            <Text style={[styles.modeName, { color: item.color }]}>{item.name}</Text>
            <Text style={styles.modeDesc}>{item.desc}</Text>
          </View>
          {isActive && (
            <View style={[styles.activeBadge, { backgroundColor: item.color }]}>
              <Ionicons name="checkmark" size={12} color="#000" />
            </View>
          )}
        </View>

        {/* Bars */}
        <View style={styles.bars}>
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>PUISSANCE</Text>
            <PowerBar pct={item.power} color={item.color} />
            <Text style={[styles.barValue, { color: item.color }]}>{item.power}%</Text>
          </View>
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>REGEN</Text>
            <PowerBar pct={item.regen * 10} color={Colors.success} />
            <Text style={[styles.barValue, { color: Colors.success }]}>{item.regen}/10</Text>
          </View>
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>TRACTION</Text>
            <PowerBar pct={item.traction * 10} color={Colors.primary} />
            <Text style={[styles.barValue, { color: Colors.primary }]}>{item.traction}/10</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {item.features.map((f) => (
            <View key={f} style={styles.feature}>
              <View style={[styles.featureDot, { backgroundColor: item.color }]} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

interface Props {
  currentMode: RideMode;
  onModeChange: (mode: RideMode) => void;
}

export default function RideModesScreen({ currentMode, onModeChange }: Props) {
  const [applying, setApplying] = useState(false);

  const applyMode = async (mode: RideMode) => {
    if (mode === currentMode) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    if (!bluetoothService.isConnected) {
      onModeChange(mode);
      return;
    }

    setApplying(true);
    try {
      await bluetoothService.setRideMode(mode);
      onModeChange(mode);
      try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
    } catch (e: any) {
      Alert.alert('Erreur', `Impossible d'appliquer le mode: ${e.message}`);
    } finally {
      setApplying(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>MODES DE CONDUITE</Text>
          <Text style={styles.subtitle}>Sélectionne un mode pour ta Surron</Text>
        </View>

        {MODES.map((item) => (
          <ModeCard
            key={item.mode}
            item={item}
            isActive={item.mode === currentMode}
            onSelect={() => applyMode(item.mode)}
          />
        ))}

        {applying && (
          <View style={styles.applyingOverlay}>
            <Text style={styles.applyingText}>Application en cours...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  fill: { height: '100%', borderRadius: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  header: { marginBottom: Spacing.lg, paddingTop: Spacing.sm },
  title: { ...Typography.h2, color: Colors.textPrimary },
  subtitle: { ...Typography.body, color: Colors.textMuted, marginTop: 4 },

  modeCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  cardTitles: { flex: 1 },
  modeName: { ...Typography.h3, fontWeight: '700', letterSpacing: 1 },
  modeDesc: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  activeBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bars: { gap: 8, marginBottom: Spacing.md },
  barRow: { flexDirection: 'row', alignItems: 'center' },
  barLabel: { ...Typography.label, color: Colors.textMuted, width: 72, fontSize: 9 },
  barValue: { ...Typography.label, width: 36, textAlign: 'right', fontSize: 10 },

  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featureDot: { width: 4, height: 4, borderRadius: 2 },
  featureText: { ...Typography.caption, color: Colors.textSecondary },

  applyingOverlay: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  applyingText: { ...Typography.body, color: Colors.primary },
});
