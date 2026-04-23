import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Typography } from '../theme';

interface Props {
  percent: number;
  voltage: number;
}

export default function BatteryBar({ percent, voltage }: Props) {
  const anim = useRef(new Animated.Value(percent)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: percent, duration: 400, useNativeDriver: false }).start();
  }, [percent]);

  const color = percent > 50 ? Colors.success :
                percent > 20 ? Colors.warning :
                Colors.danger;

  const barWidth = anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>BATTERIE</Text>
        <View style={styles.row}>
          <Text style={[styles.percent, { color }]}>{Math.round(percent)}%</Text>
          <Text style={styles.voltage}>{voltage.toFixed(1)}V</Text>
        </View>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: barWidth, backgroundColor: color }]} />
        {/* Tick marks */}
        {[25, 50, 75].map(t => (
          <View key={t} style={[styles.tick, { left: `${t}%` as any }]} />
        ))}
      </View>
      {/* Segments */}
      <View style={styles.segments}>
        {['LOW', '25%', '50%', '75%', 'FULL'].map(s => (
          <Text key={s} style={styles.segLabel}>{s}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { ...Typography.label, color: Colors.textMuted },
  percent: { ...Typography.body, fontWeight: '700', marginRight: 8 },
  voltage: { ...Typography.caption, color: Colors.textSecondary },
  track: {
    height: 12,
    backgroundColor: Colors.surface,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
  tick: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: Colors.background,
    top: 0,
  },
  segments: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  segLabel: { ...Typography.caption, color: Colors.textMuted, fontSize: 9 },
});
