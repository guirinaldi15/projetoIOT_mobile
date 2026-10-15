import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppShell } from '../components/AppShell';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: true, gcTime: 5 * 60 * 1000 },
    mutations: { retry: 0 },
  },
});

export default function RootLayout() {
  return <QueryClientProvider client={queryClient}>
    <AppShell><Slot /></AppShell>
    <StatusBar style="light"/>
  </QueryClientProvider>;
}
