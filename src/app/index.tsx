import { router } from 'expo-router';
import { Activity, ArrowRight, CheckCircle2, Cpu, Power, RadioTower, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSensors } from '../hooks/useSensors';
import { Page } from '../components/AppShell';
import { Kicker, LoadingState, Message, Panel, PrimaryButton, SyncBadge, formatSync } from '../components/Ui';
import { SensorCard, TypeDistribution } from '../components/SensorViews';
import { readableError } from '../api/client';
import { colors } from '../theme';

function Metric({ icon: Icon, label, value, subtext, accent }: {
  icon: LucideIcon; label: string; value: number; subtext: string; accent: string;
}) {
  return <Panel style={styles.metric}>
    <View style={styles.metricTop}><Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricIcon}><Icon size={18} color={accent}/></View></View>
    <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
    <Text style={styles.metricSub}>{subtext}</Text>
  </Panel>;
}

export default function Dashboard() {
  const query = useSensors();
  const sensors = query.data ?? [];
  const active = sensors.filter((sensor) => sensor.status === 1).length;
  const inactive = sensors.length - active;
  const { width } = useWindowDimensions();
  const compact = width < 700;

  return <Page>
    <View style={styles.head}>
      <View style={{ flex: 1, gap: 8 }}>
        <Kicker>VISÃO GERAL</Kicker>
        <Text style={styles.title}>Painel de controle</Text>
        <Text style={styles.subtitle}>Monitore seus sensores e acompanhe o status dos dispositivos em um só lugar.</Text>
      </View>
      <PrimaryButton label="Ver sensores" icon={ArrowRight} onPress={() => router.push('/sensores')}/>
    </View>

    <View style={styles.hero}>
      <View style={{ flex: 1, gap: 8 }}>
        <Text style={styles.heroTag}>● MONITORAMENTO DE DISPOSITIVOS</Text>
        <Text style={styles.heroTitle}>Sua central IoT{compact ? '\n' : ' '}em tempo real*</Text>
        <Text style={styles.heroSubtitle}>Consulte, identifique e controle sensores usando os dados da sua API Laravel.</Text>
        <Text style={styles.heroNote}>* Atualização por consulta a cada 15 segundos, enquanto a página estiver ativa.</Text>
      </View>
      {!compact && <View style={styles.heroIcon}><RadioTower size={66} color={colors.purple} strokeWidth={1}/></View>}
    </View>

    {query.isPending ? <LoadingState text="Carregando dados do dashboard…"/> : <>
      {query.isError && <Message title="Falha ao sincronizar sensores" description={readableError(query.error)} onRetry={() => void query.refetch()}/>}
      <View style={styles.metrics}>
        <Metric icon={Cpu} label="Total de sensores" value={sensors.length} subtext="Dispositivos encontrados" accent={colors.purple}/>
        <Metric icon={CheckCircle2} label="Sensores ligados" value={active} subtext="Status atual: 1" accent={colors.green}/>
        <Metric icon={Power} label="Sensores desligados" value={inactive} subtext="Status atual: 0" accent={colors.blue}/>
      </View>
      <View style={styles.sections}>
        <Panel style={{ flex: 1.1, minWidth: compact ? '100%' : 290 }}>
          <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Distribuição por tipo</Text><Text style={styles.sectionCaption}>Quantidade de sensores identificados</Text></View><Activity size={18} color={colors.purple}/></View>
          <TypeDistribution sensors={sensors}/>
        </Panel>
        <Panel style={{ flex: 1, minWidth: compact ? '100%' : 290 }}>
          <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Visão da operação</Text><Text style={styles.sectionCaption}>Estado atual informado pela API</Text></View><RadioTower size={18} color={colors.blue}/></View>
          <View style={styles.overviewLine}><Text style={styles.overviewLabel}>Sensores ativos</Text><Text style={styles.overviewValue}>{sensors.length ? Math.round(active / sensors.length * 100) : 0}%</Text></View>
          <View style={styles.progress}><View style={[styles.progressFill, { width: `${sensors.length ? active / sensors.length * 100 : 0}%` }]}/></View>
          <View style={styles.overviewLine}><Text style={styles.overviewLabel}>Sensores inativos</Text><Text style={styles.overviewValue}>{inactive}</Text></View>
          <View style={styles.overviewLine}><Text style={styles.overviewLabel}>Última consulta</Text><Text style={styles.overviewValue}>{query.dataUpdatedAt ? new Date(query.dataUpdatedAt).toLocaleTimeString('pt-BR') : '—'}</Text></View>
          <SyncBadge active={query.isFetching}/>
        </Panel>
      </View>
      <View style={styles.listHead}><View style={{ gap: 4 }}><Text style={styles.sectionTitle}>Sensores recentes</Text>
        <Text style={styles.sectionCaption}>{formatSync(query.dataUpdatedAt)}</Text></View>
        <PrimaryButton outline label="Ver todos" onPress={() => router.push('/sensores')}/></View>
      {sensors.length ? <View style={{ gap: 10 }}>{sensors.slice(0, 4).map((sensor) => <SensorCard key={sensor.codigo} sensor={sensor}/>)}</View> :
        <Message kind="info" title="Nenhum sensor na lista" description="A API retornou uma lista vazia. Assim que houver sensores, eles aparecerão aqui."/>}
    </>}
  </Page>;
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 20, justifyContent: 'space-between' },
  title: { color: colors.text, fontSize: 31, fontWeight: '900', letterSpacing: -1.2 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 22, maxWidth: 570 },
  hero: { backgroundColor: '#211936', borderColor: '#4A346E', borderWidth: 1, borderRadius: 24, padding: 26, flexDirection: 'row', alignItems: 'center', gap: 20 },
  heroTag: { color: colors.purple, fontWeight: '900', fontSize: 10, letterSpacing: 1.3 },
  heroTitle: { color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  heroSubtitle: { color: '#BEB5D7', lineHeight: 20, fontSize: 13 },
  heroNote: { color: '#978AAE', fontSize: 10, marginTop: 7 },
  heroIcon: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#312450', justifyContent: 'center', alignItems: 'center', borderColor: '#60459A', borderWidth: 1 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  metric: { flex: 1, flexBasis: 210, minWidth: 185, minHeight: 164 },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  metricIcon: { backgroundColor: '#2B2340', padding: 8, borderRadius: 10 },
  metricValue: { fontWeight: '900', fontSize: 39, letterSpacing: -2 },
  metricSub: { color: colors.faint, fontSize: 11 },
  sections: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 27 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  sectionCaption: { color: colors.muted, fontSize: 11, marginTop: 5 },
  overviewLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  overviewLabel: { color: colors.muted, fontSize: 12 },
  overviewValue: { color: colors.text, fontSize: 13, fontWeight: '700' },
  progress: { height: 9, borderRadius: 8, backgroundColor: '#343047', overflow: 'hidden', marginBottom: 23 },
  progressFill: { backgroundColor: colors.green, height: '100%', borderRadius: 8 },
  listHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14 },
});
