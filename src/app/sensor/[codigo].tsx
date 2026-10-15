import { useEffect, useRef, useState } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import { Animated, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ArrowLeft, Power, RefreshCw, ShieldCheck } from 'lucide-react-native';
import { Page } from '../../components/AppShell';
import { Kicker, LoadingState, Message, Panel, StatusPill, SyncBadge, formatSync } from '../../components/Ui';
import { TypeIcon, sensorVisual } from '../../components/SensorViews';
import { useSensorStatus, useSensors, useUpdateSensorStatus } from '../../hooks/useSensors';
import { readableError } from '../../api/client';
import { colors } from '../../theme';

export default function SensorDetails() {
  const params = useLocalSearchParams<{ codigo: string | string[] }>();
  const codigo = typeof params.codigo === 'string' ? params.codigo.trim() : '';
  const single = useSensorStatus(codigo);
  const list = useSensors();
  const mutation = useUpdateSensorStatus();
  const sensor = list.data?.find((s) => s.codigo === codigo);
  const tipo = sensor?.tipo || 'Sensor IoT';
  const { width } = useWindowDimensions();
  const compact = width < 780;
  const [message, setMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!mutation.isPending) { pulse.setValue(1); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 0.88, duration: 550, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 550, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [mutation.isPending, pulse]);

  async function togglePower() {
    if (single.data === undefined || mutation.isPending) return;
    setMessage(null);
    try {
      const expected = single.data === 1 ? 0 : 1;
      await mutation.mutateAsync({ codigo, status: expected });
      setMessage({ type: 'success', content: `Sensor ${codigo} ${expected === 1 ? 'ligado' : 'desligado'} com sucesso. Status confirmado pela API.` });
    } catch (error) {
      setMessage({ type: 'error', content: readableError(error) });
      void single.refetch();
    }
  }

  return <Page>
    <View style={{ gap: 15 }}>
      <Link href="/sensores" asChild><Pressable accessibilityRole="link" style={styles.back}><ArrowLeft color={colors.purple} size={17}/><Text style={styles.backLabel}>Voltar aos sensores</Text></Pressable></Link>
      <Kicker>CONTROLE INDIVIDUAL</Kicker>
      <Text style={styles.title}>Detalhes do sensor</Text>
      <Text style={styles.subtitle}>Consulta por código e atualização direta no servidor Laravel.</Text>
    </View>
    {!codigo ? <Message title="Código de sensor inválido" description="Abra um dispositivo pela listagem ou pesquise um código válido."/> :
      single.isPending ? <LoadingState text={`Consultando ${codigo}…`}/> : <>
        {single.isError && <Message title="Falha ao consultar o sensor" description={readableError(single.error)} onRetry={() => void single.refetch()}/>}
        {single.data !== undefined && <View style={[styles.columns, { flexDirection: compact ? 'column' : 'row' }]}>
          <Panel style={{ flex: 1, gap: 20 }}>
            <View style={styles.identity}><TypeIcon tipo={tipo} size={29}/><View style={{ flex: 1, gap: 5 }}><Text style={styles.identityType}>{sensorVisual(tipo).label}</Text><Text style={styles.identityCode}>Código: {codigo}</Text></View><StatusPill status={single.data}/></View>
            <View style={styles.separator}/>
            <Text style={styles.sectionTitle}>Estado do dispositivo</Text>
            <View style={styles.powerArea}>
              <Animated.View style={{ transform: [{ scale: pulse }] }}>
                <Pressable accessibilityRole="button" accessibilityLabel={single.data === 1 ? 'Desligar sensor' : 'Ligar sensor'}
                  accessibilityState={{ disabled: mutation.isPending }} disabled={mutation.isPending}
                  onPress={() => void togglePower()}
                  style={({ pressed }) => [styles.powerButton, single.data === 1 ? styles.powerOn : styles.powerOff, pressed && { opacity: 0.8 }]}>
                  <Power size={46} color={single.data === 1 ? colors.green : colors.purple} strokeWidth={1.8}/>
                </Pressable>
              </Animated.View>
              <Text style={styles.powerTitle}>{mutation.isPending ? 'Enviando comando…' : single.data === 1 ? 'Sensor ligado' : 'Sensor desligado'}</Text>
              <Text style={styles.powerSubtitle}>{mutation.isPending ? 'Aguardando confirmação do servidor' : 'Clique no botão para alternar o status'}</Text>
            </View>
            {message && <Message kind={message.type} title={message.type === 'success' ? 'Alteração confirmada' : 'Não foi possível alterar o sensor'} description={message.content}/>}
          </Panel>
          <Panel style={{ flex: 0.85, gap: 20 }}>
            <Text style={styles.sectionTitle}>Informações técnicas</Text>
            <InfoRow label="Código" value={codigo}/>
            <InfoRow label="Tipo" value={sensorVisual(tipo).label}/>
            <InfoRow label="Status numérico" value={String(single.data)}/>
            <InfoRow label="Última consulta" value={formatSync(single.dataUpdatedAt)}/>
            <View style={styles.separator}/>
            <View style={{ gap: 11 }}><View style={styles.noteHeading}><ShieldCheck size={18} color={colors.green}/><Text style={styles.noteTitle}>Controle seguro</Text></View>
              <Text style={styles.noteText}>Ao ligar ou desligar, o aplicativo envia PUT /sensor/status/atualizar e confirma com uma nova consulta GET por código.</Text>
              <SyncBadge active={single.isFetching}/>
              <Pressable accessibilityRole="button" onPress={() => void single.refetch()} style={styles.updateButton}><RefreshCw color={colors.purple} size={15}/><Text style={styles.updateLabel}>Consultar novamente</Text></Pressable>
            </View>
          </Panel>
        </View>}
      </>}
  </Page>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  back: { flexDirection: 'row', gap: 8, alignItems: 'center', alignSelf: 'flex-start' },
  backLabel: { color: colors.purple, fontSize: 12, fontWeight: '700' },
  title: { color: colors.text, fontSize: 31, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: colors.muted, fontSize: 13 },
  columns: { gap: 16, alignItems: 'stretch' },
  identity: { flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  identityType: { color: colors.text, fontSize: 17, fontWeight: '800' },
  identityCode: { color: colors.muted, fontSize: 12 },
  separator: { height: 1, backgroundColor: colors.line },
  sectionTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  powerArea: { alignItems: 'center', gap: 10, paddingVertical: 30 },
  powerButton: { borderRadius: 200, height: 154, width: 154, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  powerOn: { backgroundColor: '#173B34', borderColor: '#2F886D' },
  powerOff: { backgroundColor: '#2B2249', borderColor: '#7956C3' },
  powerTitle: { color: colors.text, fontWeight: '900', fontSize: 22, marginTop: 12 },
  powerSubtitle: { color: colors.muted, fontSize: 12, textAlign: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 18, alignItems: 'center' },
  infoLabel: { color: colors.muted, fontSize: 12, flex: 1 },
  infoValue: { color: colors.text, fontSize: 12, fontWeight: '700', textAlign: 'right', flex: 1.3 },
  noteHeading: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  noteTitle: { color: colors.text, fontWeight: '800', fontSize: 13 },
  noteText: { color: colors.muted, fontSize: 12, lineHeight: 21 },
  updateButton: { alignSelf: 'flex-start', paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  updateLabel: { color: colors.purple, fontWeight: '700', fontSize: 12 },
});
