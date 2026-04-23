import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { bluetoothService } from '../services/BluetoothService';
import { TorpConfig, RideMode } from '../services/TorpProtocol';

const DEFAULT_CONFIG: TorpConfig = {
  maxPower: 100,
  maxSpeed: 0,
  regenStrength: 5,
  tractionControl: 5,
  startupBehavior: 1,
  batteryLowProtect: 58.0,
  motorTempLimit: 100,
  controllerTempLimit: 80,
  currentRideMode: RideMode.TRAIL,
};

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  color = Colors.primary,
  description,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  color?: string;
  description?: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const segments = Math.round((max - min) / step);

  return (
    <View style={sliderStyles.row}>
      <View style={sliderStyles.header}>
        <Text style={sliderStyles.label}>{label}</Text>
        <Text style={[sliderStyles.value, { color }]}>
          {value}{unit}
        </Text>
      </View>
      {description && <Text style={sliderStyles.desc}>{description}</Text>}

      {/* Custom segmented slider */}
      <View style={sliderStyles.track}>
        <View style={[sliderStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
        <View style={[sliderStyles.handle, { left: `${pct}%` as any, backgroundColor: color }]} />
      </View>

      {/* Step buttons */}
      <View style={sliderStyles.btnRow}>
        <TouchableOpacity
          onPress={() => { onChange(Math.max(min, value - step)); try { Haptics.selectionAsync(); } catch {} }}
          style={sliderStyles.btn}
        >
          <Text style={sliderStyles.btnText}>−</Text>
        </TouchableOpacity>

        <View style={sliderStyles.stepRow}>
          {Array.from({ length: Math.min(segments + 1, 11) }, (_, i) => {
            const v = min + i * ((max - min) / Math.min(segments, 10));
            const active = value >= v - step / 2;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => { onChange(Math.round(v)); try { Haptics.selectionAsync(); } catch {} }}
                style={[sliderStyles.segment, active && { backgroundColor: color }]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          onPress={() => { onChange(Math.min(max, value + step)); try { Haptics.selectionAsync(); } catch {} }}
          style={sliderStyles.btn}
        >
          <Text style={sliderStyles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={styles.sectionHeader}>
      <MaterialCommunityIcons name={icon as any} size={16} color={Colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function InfoRow({ label, value, unit = '', color = Colors.textPrimary }: {
  label: string; value: string; unit?: string; color?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, { color }]}>{value}{unit && <Text style={styles.infoUnit}> {unit}</Text>}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const [config, setConfig] = useState<TorpConfig>(DEFAULT_CONFIG);
  const [firmwareVer, setFirmwareVer] = useState<string>('--');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [speedLimitEnabled, setSpeedLimitEnabled] = useState(false);

  useEffect(() => {
    if (bluetoothService.isConnected) {
      loadFromController();
    }
  }, []);

  const loadFromController = async () => {
    setLoading(true);
    try {
      const cfg = await bluetoothService.getConfig();
      setConfig(cfg);
      setSpeedLimitEnabled(cfg.maxSpeed > 0);
      const fw = await bluetoothService.getFirmwareVersion();
      setFirmwareVer(fw);
    } catch (e: any) {
      Alert.alert('Lecture impossible', e.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (key: keyof TorpConfig) => (value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const saveConfig = async () => {
    if (!bluetoothService.isConnected) {
      Alert.alert('Non connecté', 'Connecte ta Surron pour sauvegarder les paramètres.');
      return;
    }
    const cfg = { ...config, maxSpeed: speedLimitEnabled ? config.maxSpeed : 0 };
    setLoading(true);
    try {
      await bluetoothService.setConfig(cfg);
      setSaved(true);
      try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmResetTrip = () => {
    Alert.alert(
      'Réinitialiser le trajet',
      'Les données du trajet actuel seront effacées. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser', style: 'destructive',
          onPress: () => bluetoothService.resetTrip().catch(() => {}),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>PARAMÈTRES</Text>
          <Text style={styles.subtitle}>Configuration TORP 500</Text>
        </View>

        {/* Power section */}
        <View style={styles.card}>
          <SectionHeader title="PUISSANCE" icon="lightning-bolt" />
          <SliderRow
            label="PUISSANCE MAX"
            value={config.maxPower}
            min={10} max={100} step={5} unit="%"
            color={Colors.modeRace}
            description="Limite la puissance maximale du moteur"
            onChange={update('maxPower')}
          />
        </View>

        {/* Speed section */}
        <View style={styles.card}>
          <SectionHeader title="VITESSE" icon="speedometer" />
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>LIMITEUR DE VITESSE</Text>
              <Text style={styles.toggleDesc}>Active une limite de vitesse maximale</Text>
            </View>
            <Switch
              value={speedLimitEnabled}
              onValueChange={setSpeedLimitEnabled}
              trackColor={{ false: Colors.border, true: Colors.primaryDim }}
              thumbColor={speedLimitEnabled ? Colors.primary : Colors.textMuted}
            />
          </View>
          {speedLimitEnabled && (
            <SliderRow
              label="VITESSE MAX"
              value={config.maxSpeed || 45}
              min={20} max={100} step={5} unit=" km/h"
              color={Colors.modeTrail}
              onChange={update('maxSpeed')}
            />
          )}
        </View>

        {/* Regen section */}
        <View style={styles.card}>
          <SectionHeader title="FREINAGE RÉGÉNÉRATIF" icon="battery-charging-outline" />
          <SliderRow
            label="FORCE DE REGEN"
            value={config.regenStrength}
            min={0} max={10} step={1}
            color={Colors.success}
            description="0 = aucun freinage moteur • 10 = freinage fort"
            onChange={update('regenStrength')}
          />
        </View>

        {/* Traction control */}
        <View style={styles.card}>
          <SectionHeader title="CONTRÔLE DE TRACTION" icon="car-traction-control" />
          <SliderRow
            label="NIVEAU TC"
            value={config.tractionControl}
            min={0} max={10} step={1}
            color={Colors.modeTrail}
            description="0 = désactivé • 10 = intervention maximale"
            onChange={update('tractionControl')}
          />
        </View>

        {/* Startup */}
        <View style={styles.card}>
          <SectionHeader title="DÉMARRAGE" icon="rocket-launch-outline" />
          <Text style={styles.fieldLabel}>COMPORTEMENT AU DÉMARRAGE</Text>
          <View style={styles.optRow}>
            {[
              { v: 0, label: 'DOUX', color: Colors.modeEco },
              { v: 1, label: 'NORMAL', color: Colors.modeTrail },
              { v: 2, label: 'AGRESSIF', color: Colors.modeRace },
            ].map(opt => (
              <TouchableOpacity
                key={opt.v}
                onPress={() => update('startupBehavior')(opt.v)}
                style={[
                  styles.optBtn,
                  config.startupBehavior === opt.v && {
                    backgroundColor: `${opt.color}20`,
                    borderColor: opt.color,
                  },
                ]}
              >
                <Text style={[
                  styles.optBtnText,
                  { color: config.startupBehavior === opt.v ? opt.color : Colors.textMuted },
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Protections */}
        <View style={styles.card}>
          <SectionHeader title="PROTECTIONS" icon="shield-check-outline" />
          <SliderRow
            label="TENSION BATTERIE BASSE"
            value={config.batteryLowProtect}
            min={48} max={66} step={0.5} unit=" V"
            color={Colors.warning}
            description="Le contrôleur coupe la puissance sous cette tension"
            onChange={update('batteryLowProtect')}
          />
          <SliderRow
            label="TEMP. MAX MOTEUR"
            value={config.motorTempLimit}
            min={60} max={120} step={5} unit="°C"
            color={Colors.danger}
            onChange={update('motorTempLimit')}
          />
          <SliderRow
            label="TEMP. MAX CONTRÔLEUR"
            value={config.controllerTempLimit}
            min={50} max={100} step={5} unit="°C"
            color={Colors.danger}
            onChange={update('controllerTempLimit')}
          />
        </View>

        {/* Controller info */}
        <View style={styles.card}>
          <SectionHeader title="INFORMATIONS" icon="information-outline" />
          <InfoRow label="Firmware TORP" value={firmwareVer} color={Colors.primary} />
          <InfoRow label="Puissance nominale" value="500" unit="W" />
          <InfoRow label="Tension nominale" value="60" unit="V" />
          <InfoRow label="Courant max" value="35" unit="A" />

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionBtn} onPress={confirmResetTrip}>
            <MaterialCommunityIcons name="restore" size={18} color={Colors.warning} />
            <Text style={[styles.actionBtnText, { color: Colors.warning }]}>
              Réinitialiser le trajet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={loadFromController}
            disabled={!bluetoothService.isConnected}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={18}
              color={bluetoothService.isConnected ? Colors.primary : Colors.textMuted}
            />
            <Text style={[
              styles.actionBtnText,
              { color: bluetoothService.isConnected ? Colors.primary : Colors.textMuted },
            ]}>
              Recharger depuis le contrôleur
            </Text>
          </TouchableOpacity>
        </View>

        {/* Save button */}
        <TouchableOpacity onPress={saveConfig} disabled={loading} style={styles.saveBtn}>
          <LinearGradient
            colors={saved ? [Colors.success, Colors.successDim] : [Colors.primary, Colors.primaryDim]}
            style={styles.saveBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.saveBtnText}>
              {loading ? 'SAUVEGARDE...' : saved ? '✓ SAUVEGARDÉ' : 'SAUVEGARDER'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  row: { marginBottom: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { ...Typography.body, color: Colors.textPrimary, fontWeight: '600' },
  value: { ...Typography.body, fontWeight: '700' },
  desc: { ...Typography.caption, color: Colors.textMuted, marginBottom: 8 },
  track: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'visible',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  fill: { height: '100%', borderRadius: 3 },
  handle: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    top: -4,
    marginLeft: -7,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  btn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnText: { color: Colors.textPrimary, fontSize: 18, lineHeight: 22 },
  stepRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  header: { marginBottom: Spacing.lg, paddingTop: Spacing.sm },
  title: { ...Typography.h2, color: Colors.textPrimary },
  subtitle: { ...Typography.body, color: Colors.textMuted, marginTop: 4 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: { ...Typography.label, color: Colors.primary },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  toggleLabel: { ...Typography.body, color: Colors.textPrimary, fontWeight: '600' },
  toggleDesc: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },

  fieldLabel: { ...Typography.label, color: Colors.textMuted, marginBottom: Spacing.sm },
  optRow: { flexDirection: 'row', gap: 8 },
  optBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  optBtnText: { ...Typography.label, fontWeight: '700' },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: { ...Typography.body, color: Colors.textSecondary },
  infoValue: { ...Typography.body, fontWeight: '600' },
  infoUnit: { color: Colors.textMuted },

  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: Spacing.sm,
  },
  actionBtnText: { ...Typography.body, fontWeight: '500' },

  saveBtn: { borderRadius: BorderRadius.md, overflow: 'hidden', marginTop: Spacing.sm },
  saveBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: { ...Typography.body, fontWeight: '700', color: '#000', letterSpacing: 1 },
});
