import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Colors, Typography } from '../theme';

interface Props {
  value: number;
  max: number;
  size: number;
  label: string;
  unit: string;
  color?: string;
  strokeWidth?: number;
  decimals?: number;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

export default function ArcGauge({
  value, max, size, label, unit, color = Colors.primary, strokeWidth = 8, decimals = 0,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth * 2) / 2 - 4;
  const startAngle = -220;
  const totalAngle = 260;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const endAngle = startAngle + totalAngle * pct;

  const displayValue = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLinearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.6" />
            <Stop offset="1" stopColor={color} stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {/* Background track */}
        <Path
          d={arcPath(cx, cy, r, startAngle, startAngle + totalAngle)}
          fill="none"
          stroke={Colors.border}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Value arc */}
        {pct > 0.01 && (
          <Path
            d={arcPath(cx, cy, r, startAngle, endAngle)}
            fill="none"
            stroke={`url(#arcGrad)`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}

        {/* Glow dot at end */}
        {pct > 0.01 && pct < 0.99 && (() => {
          const pos = polarToCartesian(cx, cy, r, endAngle);
          return (
            <Circle
              cx={pos.x}
              cy={pos.y}
              r={strokeWidth / 2 + 1}
              fill={color}
            />
          );
        })()}
      </Svg>

      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={[styles.value, { color }]}>{displayValue}</Text>
        <Text style={styles.unit}>{unit}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  value: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -1,
  },
  unit: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: -2,
  },
  label: {
    ...Typography.label,
    color: Colors.textMuted,
    marginTop: 4,
    fontSize: 9,
  },
});
