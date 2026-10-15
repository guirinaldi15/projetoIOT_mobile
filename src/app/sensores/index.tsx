import { useState } from 'react';
import { router } from 'expo-router';
import { Search, RefreshCw, ScanSearch } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Page } from '../../components/AppShell';
import { EmptyState, Kicker, LoadingState, Message, Panel, PrimaryButton, SyncBadge, formatSync } from '../../components/Ui';
import { SensorCard } from '../../components/SensorViews';
import { useSensors, sensorStatusOptions } from '../../hooks/useSensors';
import { readableError } from '../../api/client';
import { colors } from '../../theme';

export default function SensorsScreen() {
  const query = useSensors();
  const client = useQueryClient();
  const [codigo, setCodigo] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  async function searchByCode() {
    const code = codigo.trim();
    if (!code || searching) {
      if (!code) setSearchError('Digite o código do sensor para consultar.');
      return;
    }
    setSearching(true);
    setSearchError(null);
    try {
      // Consulta por código diretamente no GET /visualizar/{codigo}, e não só no filtro local.
      await client.fetchQuery(sensorStatusOptions(code));
      router.push({ pathname: '/sensor/[codigo]', params: { codigo: code } });
    } catch (error) {
      setSearchError(readableError(error));
    } finally {
      setSearching(false);
    }
  }

  return <Page>
    <View style={{ gap: 8 }}><Kicker>GERENCIAMENTO</Kicker><Text style={styles.title}>Todos os sensores</Text>
      <Text style={styles.subtitle}>Consulte os dispositivos da API ou busque um sensor específico pelo código.</Text></View>
    <Panel style={{ gap: 14 }}>
      <Text style={styles.searchTitle}>Consultar sensor pelo código</Text>
      <View style={styles.searchRow}>
        <View style={styles.inputBox}><Search color={colors.faint} size={19}/><TextInput
          style={styles.input} value={codigo} onChangeText={(value) => { setCodigo(value); setSearchError(null); }}
          placeholder="Ex.: S1 ou SENSOR001" placeholderTextColor={colors.faint} autoCapitalize="none"
          returnKeyType="search" onSubmitEditing={() => void searchByCode()}
          accessibilityLabel="Código do sensor" /></View>
        <PrimaryButton label="Buscar código" icon={ScanSearch} loading={searching} disabled={searching} onPress={() => void searchByCode()}/>
      </View>
      {!!searchError && <Message title="Consulta não realizada" description={searchError}/>}
      <Text style={styles.hint}>{'A busca utiliza GET /sensor/status/visualizar/{codigo}.'}</Text>
    </Panel>
    <View style={styles.listHead}>
      <View style={{ gap: 5 }}><Text style={styles.listTitle}>Lista completa</Text>
        <Text style={styles.subtitle}>{query.data ? `${query.data.length} sensor(es) retornado(s)` : 'Aguardando API'} · {formatSync(query.dataUpdatedAt)}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Atualizar listagem" onPress={() => void query.refetch()}
        style={({ pressed }) => [styles.refresh, pressed && { opacity: 0.7 }]}>
        <RefreshCw color={colors.purple} size={18}/><Text style={styles.refreshText}>Atualizar</Text>
      </Pressable>
    </View>
    <SyncBadge active={query.isFetching}/>
    {query.isPending ? <LoadingState/> : <>
      {query.isError && <Message title="Não foi possível carregar a listagem" description={readableError(query.error)} onRetry={() => void query.refetch()}/>}
      {query.data?.length === 0 ? <EmptyState/> :
        <View style={styles.grid}>{query.data?.map((sensor) => <View key={sensor.codigo} style={styles.cell}>
          <SensorCard sensor={sensor}/>
        </View>)}</View>}
    </>}
  </Page>;
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontWeight: '900', fontSize: 31, letterSpacing: -1 },
  subtitle: { color: colors.muted, fontSize: 12, lineHeight: 20 },
  searchTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  searchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  inputBox: { minWidth: 210, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 13, paddingHorizontal: 14, backgroundColor: '#100F1B', borderWidth: 1, borderColor: colors.line, height: 47 },
  input: { flex: 1, color: colors.text, fontSize: 13, minWidth: 0, },
  hint: { color: colors.faint, fontSize: 11 },
  listHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  listTitle: { color: colors.text, fontWeight: '800', fontSize: 18 },
  refresh: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 9 },
  refreshText: { color: colors.purple, fontWeight: '700', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { flexBasis: 345, flexGrow: 1, minWidth: 0 },
});
