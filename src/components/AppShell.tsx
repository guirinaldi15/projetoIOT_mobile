import type { ReactNode } from 'react';
import { Link, usePathname } from 'expo-router';
import { Activity, House, RadioTower, ShieldCheck, type LucideIcon } from 'lucide-react-native';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { colors } from '../theme';

const links: { href: '/' | '/sensores'; label: string; Icon: LucideIcon }[] = [
  { href: '/', label: 'Dashboard', Icon: House },
  { href: '/sensores', label: 'Sensores', Icon: Activity },
];

function Navigation({ compact }: { compact: boolean }) {
  const pathname = usePathname();
  return <View style={compact ? styles.bottomItems : { gap: 8 }}>
    {links.map(({ href, label, Icon }) => {
      const active = href === '/' ? pathname === '/' : pathname.startsWith('/sensores') || pathname.startsWith('/sensor/');
      return <Link key={href} href={href} asChild>
        <Pressable accessibilityRole="link" style={({ pressed }) => [compact ? styles.bottomLink : styles.navLink,
          active && (compact ? styles.bottomActive : styles.navActive), pressed && { opacity: 0.8 }]}>
          <Icon size={compact ? 21 : 19} color={active ? colors.purple : colors.muted}/>
          <Text style={[styles.navText, active && styles.navTextActive, compact && { fontSize: 11 }]}>{label}</Text>
        </Pressable>
      </Link>;
    })}
  </View>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  return <SafeAreaView style={styles.root}>
    {desktop && <View style={styles.sidebar}>
      <View style={styles.brand}><View style={styles.brandIcon}><RadioTower color={colors.purple} size={25}/></View>
        <View><Text style={styles.brandTitle}>IoT Control</Text><Text style={styles.brandSubtitle}>SENSOR MANAGEMENT</Text></View></View>
      <Text style={styles.navCaption}>NAVEGAÇÃO</Text>
      <Navigation compact={false}/>
      <View style={{ flex: 1 }}/>
      <View style={styles.sideFooter}><ShieldCheck color={colors.green} size={18}/>
        <View><Text style={styles.footerTitle}>Integração Laravel</Text><Text style={styles.footerCaption}>Consultas GET e PUT</Text></View></View>
    </View>}
    <View style={styles.main}>
      <View style={styles.topbar}>
        {!desktop ? <View style={styles.compactBrand}><RadioTower color={colors.purple} size={21}/><Text style={styles.brandTitle}>IoT Control</Text></View> :
          <View style={{ flexDirection: 'row', gap: 9, alignItems: 'center' }}><View style={styles.bullet}/><Text style={styles.topText}>PAINEL DE CONTROLE / MONITORAMENTO</Text></View>}
        <View style={styles.liveChip}><View style={styles.bulletGreen}/><Text style={styles.liveText}>API Laravel</Text></View>
      </View>
      {children}
      {!desktop && <View style={styles.bottomNav}><Navigation compact/></View>}
    </View>
  </SafeAreaView>;
}

export function Page({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  return <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled"
    contentContainerStyle={[styles.page, { padding: width < 600 ? 19 : 34, paddingBottom: 110 }]}>
    <View style={{ width: '100%', maxWidth: 1260, alignSelf: 'center', gap: 24 }}>{children}</View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
  sidebar: { width: 250, backgroundColor: colors.sidebar, borderRightWidth: 1, borderColor: colors.line, paddingHorizontal: 20, paddingVertical: 26 },
  brand: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 48 },
  brandIcon: { width: 43, height: 43, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2B2145', borderRadius: 14 },
  brandTitle: { color: colors.text, fontSize: 19, fontWeight: '900', letterSpacing: -0.4 },
  brandSubtitle: { color: colors.faint, fontSize: 9, fontWeight: '800', letterSpacing: 1.2, marginTop: 4 },
  navCaption: { color: colors.faint, fontSize: 10, fontWeight: '800', letterSpacing: 1.8, marginBottom: 13, marginLeft: 13 },
  navLink: { flexDirection: 'row', gap: 13, alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16, borderRadius: 12 },
  navActive: { backgroundColor: '#2A2046' },
  navText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  navTextActive: { color: '#D4C7FF' },
  sideFooter: { borderColor: colors.line, borderWidth: 1, borderRadius: 14, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 9 },
  footerTitle: { color: colors.text, fontWeight: '700', fontSize: 11 },
  footerCaption: { color: colors.muted, fontSize: 10, marginTop: 3 },
  main: { flex: 1, minWidth: 0 },
  topbar: { height: 77, borderBottomWidth: 1, borderColor: colors.line, paddingHorizontal: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.purple },
  topText: { fontSize: 10, fontWeight: '800', color: colors.faint, letterSpacing: 1.6 },
  compactBrand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  liveChip: { backgroundColor: '#29203E', borderColor: '#4F3B78', borderWidth: 1, paddingVertical: 8, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 30 },
  bulletGreen: { width: 7, height: 7, backgroundColor: colors.purple, borderRadius: 7 },
  liveText: { fontSize: 11, color: colors.purple, fontWeight: '700' },
  page: { flexGrow: 1 },
  bottomNav: { paddingBottom: 7, paddingTop: 10, borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.sidebar },
  bottomItems: { flexDirection: 'row', justifyContent: 'space-around' },
  bottomLink: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 4, paddingVertical: 7, borderRadius: 12 },
  bottomActive: { backgroundColor: '#211A36' },
});
