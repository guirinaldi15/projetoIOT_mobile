import axios from 'axios';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://10.137.11.6/api')
  .trim().replace(/\/+$/, '');

export const api = axios.create({
  baseURL: API_URL,
  timeout: 12000,
  headers: { Accept: 'application/json' }, // GET não força preflight de CORS por Content-Type
});

export function readableError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const payload: unknown = error.response?.data;
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      const body = payload as Record<string, unknown>;
      const message = typeof body.error === 'string' ? body.error : body.message;
      if (typeof message === 'string' && message.trim()) return message;
    }
    if (error.response?.status === 404) return 'Sensor não encontrado.';
    if (error.code === 'ECONNABORTED') return 'A API demorou demais para responder. Tente novamente.';
    if (!error.response) return 'Sem conexão com o Laravel. Verifique o IP, o servidor e as permissões de CORS.';
    return `Falha na comunicação com a API (HTTP ${error.response.status}).`;
  }
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}
