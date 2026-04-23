import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Typography } from '../theme';
import { bluetoothService } from '../services/BluetoothService';
import { RideMode, PowerMap, DEFAULT_POWER_MAPS } from '../services/TorpProtocol';

const { width } = Dimensions.get('window');
const CHART_W = width - Spacing.md * 2 - Spacing.md * 2;
const CHART_H = 220;
const PAD = { top: 20, right: 20, bottom: 30, left: 36 };
const PLOT_W = CHART_W - PAD.left - PAD.right;
const PLOT_H = CHART_H - PAD.top - PAD.bottom;
const N = 10;

function pointToXY(i: number, val: number) {
  return {
    x: PAD.left + (i / (N - 1)) * PLOT_W,
    y: PAD.top + PLOT_H - (val / 100) * PLOT_H,
  };
}

function buildCurvePath(points: number[]): string {
  const pts = points.map((v, i) => pointToXY(i, v));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpX = (prev.x + curr.x) / 2;
    d += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function buildFillPath(points: number[]): string {
  const curve = buildCurvePath(points);
  const lastPt = pointToXY(N - 1, points[N - 1]);
  const firstPt = pointToXY(0, points[0]);
  return `${curve} L ${lastPt.x} ${PAD.top + PLOT_H} L ${firstPt.x} ${PAD.top + PLOT_H} Z`;
}

interface MapChartProps {
  points: number[];
  color: string;
  onPointMove: (index: number, value: number) => void;
}

function MapChart({ points, color, onPointMove }: MapChartProps) {
  const [dragging, setDragging] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDragging(index);
    try { Haptics.selectionAsync(); } catch {}
  }, []);

  const handlePanMove = useCallback((index: number, dy: number, startVal: number) => {
    const delta = -(dy / PLOT_H) * 100;
    const newVal = Math.min(100, Math.max(0, Math.round(startVal + delta)));
    onPointMove(index, newVal);
  }, [onPointMove]);

  const gridLines = [0, 25, 50, 75, 100];
  const xLabels = ['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100'];

  return (
    <View style={{ width: CHART_W, height: CHART_H }}>
      <Svg width={CHART_W} height={CHART_H}>
        <Defs>
          <SvgGrad id="mapFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.25" />
            <Stop offset="1" stopColor={color} stopOpacity="0.02" />
          </SvgGrad>
        </Defs>

        {/* Grid */}
        {gridLines.map((g) => {
          const y = PAD.top + PLOT_H - (g / 100) * PLOT_H;
          return (
            <React.Fragment key={g}>
              <Line
                x1={PAD.left} y1={y} x2={PAD.left + PLOT_W} y2={y}
                stroke={Colors.border} strokeWidth={1} strokeDasharray={g === 0 ? undefined : '4,4'}
              />
              <SvgText
                x={PAD.left - 6} y={y + 4}
                fill={Colors.textMuted} fontSize={9} textAnchor="end"
              >{g}</SvgText>
            </React.Fragment>
          );
        })}

        {/* X labels */}
        {points.map((_, i) => {
          const { x } = pointToXY(i, 0);
          return (
            <SvgText key={i} x={x} y={CHART_H - 4} fill={Colors.textMuted} fontSize={8} textAnchor="middle">
              {xLabels[i]}%
            </SvgText>
          );
        })}

        {/* Fill */}
        <Path d={buildFillPath(points)} fill="url(#mapFill)" />

        {/* Curve */}
        <Path
          d={buildCurvePath(points)}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Drag points */}
        {points.map((v, i) => {
          const { x, y } = pointToXY(i, v);
          const isDrag = dragging === i;
          let startY = 0;
          let startVal = v;

          const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: (e) => {
              startY = e.nativeEvent.pageY;
              startVal = points[i];
              handleDragStart(i);
            },
            onPanResponderMove: (e) => {
              handlePanMove(i, e.nativeEvent.pageY - startY, startVal);
            },
            onPanResponderRelease: () => setDragging(null),
          });

          return (
            <React.Fragment key={i}>
              {isDrag && (
                <Circle cx={x} cy={y} r={20} fill={`${color}20`} />
              )}
              <Circle
                cx={x} cy={y}
                r={isDrag ? 8 : 5}
                fill={isDrag ? color : Colors.surface}
                stroke={color}
                strokeWidth={2}
                {...panResponder.panHandlers}
              />
              {isDrag && (
                <SvgText x={x} y={y - 14} fill={color} fontSize={10} textAnchor="middle" fontWeight="bold">
                  {v}%
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

interface Props {
  currentMode: RideMode;
}

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

export default function PowerMapScreen({ currentMode }: Props) {
  const [selectedMode, setSelectedMode] = useState<RideMode>(currentMode);
  const [maps, setMaps] = useState<Record<RideMode, PowerMap>>({ ...DEFAULT_POWER_MAPS });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const color = MODE_COLORS[selectedMode];
  const points = maps[selectedMode].points;

  const handlePointMove = useCallback((index: number, value: number) => {
    setMaps(prev => {
      const updated = [...prev[selectedMode].points];
      if (index === 0) updated[0] = 0;
      else updated[index] = Math.max(updated[index - 1], value);
      return { ...prev, [selectedMode]: { points: updated } };
    });
  }, [selectedMode]);

  const resetToDefault = () => {
    setMaps(prev => ({ ...prev, [selectedMode]: { ...DEFAULT_POWER_MAPS[selectedMode] } }));
  };

  const saveMap = async () => {
    if (!bluetoothService.isConnected) {
      Alert.alert('Non connecté', 'Connecte ta Surron via Bluetooth pour envoyer la carte de puissance.');
      return;
    }
    setSaving(true);
    try {
      await bluetoothService.setPowerMap(maps[selectedMode]);
      setSaved(true);
      try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setSaving(false);
    }
  };

  const MODES_LIST = [RideMode.ECO, RideMode.TRAIL, RideMode.ENDURO, RideMode.RACE, RideMode.CUSTOM];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A1A', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.title}>CARTE DE PUISSANCE</Text>
          <Text style={styles.subtitle}>Courbe accélérateur → puissance moteur</Text>
        </View>

        {/* Mode selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.modeTabs}
        >
          {MODES_LIST.map(m => (
            <TouchableOpacity
              key={m}
              onPress={() => setSelectedMode(m)}
              style={[
                styles.modeTab,
                selectedMode === m && { borderColor: MODE_COLORS[m], backgroundColor: `${MODE_COLORS[m]}18` },
              ]}
            >
              <Text style={[
                styles.modeTabText,
                { color: selectedMode === m ? MODE_COLORS[m] : Colors.textMuted },
              ]}>
                {MODE_NAMES[m]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chart card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={[styles.chartTitle, { color }]}>{MODE_NAMES[selectedMode]}</Text>
              <Text style={styles.chartHint}>Glisse les points pour modifier la courbe</Text>
            </View>
            <TouchableOpacity onPress={resetToDefault} style={styles.resetBtn}>
              <Text style={styles.resetText}>RESET</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartLabels}>
            <Text style={styles.axisLabel}>↑ SORTIE %</Text>
          </View>

          <MapChart
            points={points}
            color={color}
            onPointMove={handlePointMove}
          />

          <Text style={[styles.axisLabel, { alignSelf: 'center', marginTop: 4 }]}>
            ACCÉLÉRATEUR % →
          </Text>
        </View>

        {/* Point values */}
        <View style={styles.valuesCard}>
          <Text style={styles.valuesTitle}>VALEURS DE LA COURBE</Text>
          <View style={styles.valuesGrid}>
            {points.map((v, i) => (
              <View key={i} style={[styles.valueCell, { borderColor: i === 0 ? color : Colors.border }]}>
                <Text style={styles.valueCellLabel}>{i * 10 + (i === 9 ? 10 : 0)}%</Text>
                <Text style={[styles.valueCellValue, { color }]}>{v}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>COURBE PROGRESSIVE</Text>
          <Text style={styles.infoText}>
            Une courbe linéaire donne une réponse directe et précise.{'\n'}
            Une courbe exponentielle (début doux, fin agressive) convient au trail.{'\n'}
            En mode RACE, la courbe doit toujours être croissante.
          </Text>
        </View>

        {/* Save button */}
        <TouchableOpacity onPress={saveMap} disabled={saving} style={styles.saveBtn}>
          <LinearGradient
            colors={saved ? [Colors.success, Colors.successDim] : [color, `${color}80`]}
            style={styles.saveBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.saveBtnText}>
              {saving ? 'ENVOI...' : saved ? '✓ SAUVEGARDÉ' : 'ENVOYER AU TORP 500'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.md, paddingBottom: Spacing.xxl },

  header: { marginBottom: Spacing.md, paddingTop: Spacing.sm },
  title: { ...Typography.h2, color: Colors.textPrimary },
  subtitle: { ...Typography.body, color: Colors.textMuted, marginTop: 4 },

  modeTabs: { flexDirection: 'row', gap: 8, marginBottom: Spacing.md },
  modeTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeTabText: { ...Typography.label, fontWeight: '700' },

  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  chartTitle: { ...Typography.h3, fontWeight: '700' },
  chartHint: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  resetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetText: { ...Typography.label, color: Colors.textMuted },
  chartLabels: { marginBottom: 4 },
  axisLabel: { ...Typography.label, color: Colors.textMuted, fontSize: 9 },

  valuesCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  valuesTitle: { ...Typography.label, color: Colors.textMuted, marginBottom: Spacing.sm },
  valuesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  valueCell: {
    width: (CHART_W - 6 * 10) / 10,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  valueCellLabel: { ...Typography.caption, color: Colors.textMuted, fontSize: 9 },
  valueCellValue: { ...Typography.body, fontWeight: '700', fontSize: 15 },

  infoCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  infoTitle: { ...Typography.label, color: Colors.primary, marginBottom: 6 },
  infoText: { ...Typography.caption, color: Colors.textSecondary, lineHeight: 18 },

  saveBtn: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { ...Typography.body, fontWeight: '700', color: '#000', letterSpacing: 1 },
});
