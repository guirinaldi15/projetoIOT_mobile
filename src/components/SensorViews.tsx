import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowUpRight, Cpu, Droplets, RadioTower, ScanEye, Sun, Thermometer, type LucideIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors, radii } from '../theme';
import type { Sensor } from '../types';
import { StatusPill } from './Ui';

export function sensorVisual(tipo: string): { icon: LucideIcon; color: string; label: string } {
  const value = tipo.toLocaleLowerCase('pt-BR');
  if (value.includes('lumin') || value.includes('luz')) return { icon: Sun, color: '#FBBF76', label: 'Luminosidade' };
  if (value.includes('infra') || value.includes('movimento')) return { icon: ScanEye, color: '#B49BFF', label: 'Infravermelho' };
  if (value.includes('umid')) return { icon: Droplets, color: '#7AB8FF', label: 'Umidade' };
  if (value.includes('temper')) return { icon: Thermometer, color: '#FB9A9A', label: 'Temperatura' };
  if (value.includes('rede') || value.includes('sinal')) return { icon: RadioTower, color: colors.blue, label: tipo };
  return { icon: Cpu, color: colors.purple, label: tipo || 'Sensor IoT' };
}

export function TypeIcon({ tipo, size = 22 }: { tipo: string; size?: number }) {
  const { icon: Icon, color } = sensorVisual(tipo);
  return <View style={styles.iconWrap}><Icon size={size} color={color} strokeWidth={1.8}/></View>;
}

export const SensorCard = memo(function SensorCard({ sensor }: { sensor: Sensor }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ver detalhes do sensor ${sensor.codigo}`}
    onPress={() => router.push({ pathname: '/sensor/[codigo]', params: { codigo: sensor.codigo } })}
    style={({ pressed }) => [styles.sensorCard, pressed && { opacity: 0.72, borderColor: colors.purple }]}>
    <View style={styles.cardLeft}>
      <TypeIcon tipo={sensor.tipo}/>
      <View style={{ flex: 1, gap: 4 }}>
        <Text numberOfLines={1} style={styles.sensorTitle}>{sensorVisual(sensor.tipo).label}</Text>
        <Text style={styles.sensorCode}>Código: {sensor.codigo}</Text>
      </View>
    </View>
    <View style={styles.cardRight}>
      <StatusPill status={sensor.status} compact/>
      <ArrowUpRight size={17} color={colors.faint}/>
    </View>
  </Pressable>;
});

export function TypeDistribution({ sensors }: { sensors: Sensor[] }) {
  const summary = Array.from(sensors.reduce((map, sensor) => {
    const label = sensorVisual(sensor.tipo).label;
    map.set(label, (map.get(label) || 0) + 1);
    return map;
  }, new Map<string, number>()), ([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
  return <View style={{ gap: 19 }}>
    {summary.length === 0 ? <Text style={styles.sensorCode}>Sem dados para apresentar.</Text> :
      summary.map(({ label, count }) => <View key={label} style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.barLabel}>{label}</Text>
          <Text style={styles.barCount}>{count}</Text>
        </View>
        <View style={styles.barTrack}><View style={[styles.barFill, { width: `${Math.max(3, (count / sensors.length) * 100)}%` }]}/></View>
      </View>)}
  </View>;
}

const styles = StyleSheet.create({
  iconWrap: { backgroundColor: '#29213E', borderColor: '#3A3052', borderWidth: 1, borderRadius: 15, width: 52, height: 52, justifyContent: 'center', alignItems: 'center' },
  sensorCard: { borderColor: colors.line, borderWidth: 1, borderRadius: radii.md, backgroundColor: colors.panel,
    padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, minHeight: 86 },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 13, minWidth: 0 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sensorTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  sensorCode: { color: colors.muted, fontSize: 12 },
  barLabel: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  barCount: { color: colors.text, fontSize: 12, fontWeight: '800' },
  barTrack: { backgroundColor: '#35304C', borderRadius: 12, height: 7, overflow: 'hidden' },
  barFill: { height: 7, backgroundColor: colors.purple, borderRadius: 12 },
});
