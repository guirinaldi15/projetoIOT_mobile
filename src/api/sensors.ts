import { api } from './client';
import { parseSensorList, parseSingleStatus, validateUpdateResponse } from './schemas';
import type { Sensor, SensorStatus } from '../types';

export async function listSensors(signal?: AbortSignal): Promise<Sensor[]> {
  const response = await api.get<unknown>('/sensor/status/listar', { signal });
  return parseSensorList(response.data);
}

export async function getSensorStatus(codigo: string, signal?: AbortSignal): Promise<SensorStatus> {
  const response = await api.get<unknown>(`/sensor/status/visualizar/${encodeURIComponent(codigo)}`, { signal });
  return parseSingleStatus(response.data);
}

export async function setSensorStatus(codigo: string, status: SensorStatus): Promise<SensorStatus> {
  const response = await api.put<unknown>('/sensor/status/atualizar', { codigo, status });
  validateUpdateResponse(response.data, status);
  // Não basta HTTP 200: o Swagger admite respostas 200 com falha de negócio.
  const confirmed = await getSensorStatus(codigo);
  if (confirmed !== status) {
    throw new Error('O servidor não confirmou a mudança. Atualize a página e tente novamente.');
  }
  return confirmed;
}
