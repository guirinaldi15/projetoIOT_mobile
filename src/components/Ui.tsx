import { useEffect, useRef, type ReactNode } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { AlertCircle, ArrowRight, Check, RefreshCw, type LucideIcon } from 'lucide-react-native';
import { colors, radii } from '../theme';
import type { SensorStatus } from '../types';

export function Kicker({ children }: { children: ReactNode }) {
  return <Text style={styles.kicker}>{children}</Text>;
}

export function Panel({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function PrimaryButton({ label, onPress, loading = false, disabled = false, icon: Icon = ArrowRight, outline = false }: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  outline?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled || loading}
      onPress={onPress} style={({ pressed }) => [styles.button, outline && styles.buttonOutline,
        (disabled || loading) && styles.disabled, pressed && styles.buttonPressed]}>
      {loading ? <ActivityIndicator size="small" color={colors.text} /> : <Icon size={17} color={outline ? colors.purple : colors.text} strokeWidth={2.2} />}
      <Text style={[styles.buttonLabel, outline && { color: colors.purple }]}>{label}</Text>
    </Pressable>
  );
}

export function StatusPill({ status, compact = false }: { status: SensorStatus; compact?: boolean }) {
  const on = status === 1;
  return <View style={[styles.statusPill, on ? styles.statusOn : styles.statusOff, compact && { paddingVertical: 6 }]}>
    <View style={[styles.statusDot, { backgroundColor: on ? colors.green : colors.red }]} />
    <Text style={[styles.statusLabel, { color: on ? colors.green : colors.red }]}>{on ? 'Ligado' : 'Desligado'}</Text>
  </View>;
}

export function SyncBadge({ active = false }: { active?: boolean }) {
  const anim = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    if (!active) { anim.setValue(1); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.4, duration: 520, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [active, anim]);
  return <View style={styles.sync}><Animated.View style={{ opacity: anim }}>
    <RefreshCw color={colors.purple} size={13}/>
  </Animated.View><Text style={styles.syncLabel}>{active ? 'Sincronizando…' : 'Sincronização: 15 s'}</Text></View>;
}

export function Message({ kind = 'error', title, description, onRetry }: {
  kind?: 'error' | 'success' | 'info';
  title: string;
  description?: string;
  onRetry?: () => void;
}) {
  const success = kind === 'success';
  return <View style={[styles.message, success ? styles.messageSuccess : kind === 'info' ? styles.messageInfo : styles.messageError]}>
    {success ? <Check color={colors.green} size={19}/> : <AlertCircle color={kind === 'info' ? colors.blue : colors.red} size={19}/>}
    <View style={{ flex: 1, gap: 5 }}>
      <Text style={styles.messageTitle}>{title}</Text>
      {!!description && <Text style={styles.messageDetail}>{description}</Text>}
      {!!onRetry && <Pressable accessibilityRole="button" onPress={onRetry} style={{ alignSelf: 'flex-start', marginTop: 6 }}>
        <Text style={styles.retry}>Tentar novamente →</Text>
      </Pressable>}
    </View>
  </View>;
}

export function LoadingState({ text = 'Buscando sensores…' }: { text?: string }) {
  return <Panel style={{ alignItems: 'center', padding: 52, gap: 16 }}>
    <ActivityIndicator size="large" color={colors.purple}/>
    <Text style={styles.muted}>{text}</Text>
  </Panel>;
}

export function EmptyState({ title = 'Nenhum sensor encontrado', subtitle }: { title?: string; subtitle?: string }) {
  return <Panel style={{ alignItems: 'center', gap: 9, padding: 48 }}>
    <Text style={{ fontSize: 32 }}>◌</Text>
    <Text style={styles.messageTitle}>{title}</Text>
    <Text style={[styles.muted, { textAlign: 'center' }]}>{subtitle || 'Nenhum dispositivo foi retornado pelo servidor.'}</Text>
  </Panel>;
}

export function formatSync(timestamp: number): string {
  if (!timestamp) return 'Ainda não sincronizado';
  return `Atualizado às ${new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
}

const styles = StyleSheet.create({
  kicker: { color: colors.purple, fontWeight: '800', letterSpacing: 2.4, fontSize: 11 },
  panel: { backgroundColor: colors.panel, borderColor: colors.line, borderWidth: 1, borderRadius: radii.lg, padding: 22 },
  button: { minHeight: 47, alignItems: 'center', flexDirection: 'row', alignSelf: 'flex-start', justifyContent: 'center', gap: 9, paddingHorizontal: 19, borderRadius: radii.md, backgroundColor: colors.purpleDark, borderWidth: 1, borderColor: colors.purpleDark },
  buttonOutline: { backgroundColor: colors.panelAlt, borderColor: colors.line },
  buttonPressed: { opacity: 0.77, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.53 },
  buttonLabel: { color: colors.text, fontWeight: '700', fontSize: 13 },
  statusPill: { borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start' },
  statusOn: { backgroundColor: colors.greenBg }, statusOff: { backgroundColor: colors.redBg },
  statusDot: { height: 7, width: 7, borderRadius: 5 }, statusLabel: { fontSize: 12, fontWeight: '700' },
  sync: { alignItems: 'center', flexDirection: 'row', gap: 7 }, syncLabel: { color: colors.muted, fontSize: 11 },
  message: { flexDirection: 'row', gap: 12, borderRadius: radii.md, borderWidth: 1, padding: 16 },
  messageError: { backgroundColor: '#311F2D', borderColor: '#6F3B52' },
  messageSuccess: { backgroundColor: '#17332C', borderColor: '#286D58' },
  messageInfo: { backgroundColor: '#18273D', borderColor: '#2B5282' },
  messageTitle: { fontSize: 14, color: colors.text, fontWeight: '700' },
  messageDetail: { color: '#CDC6D8', fontSize: 12, lineHeight: 19 },
  retry: { color: colors.purple, fontWeight: '700', fontSize: 12 },
  muted: { fontSize: 13, color: colors.muted },
});
