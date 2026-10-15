import type { Sensor, SensorStatus } from '../types';

function object(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('A API retornou dados em um formato inesperado.');
  }
  return value as Record<string, unknown>;
}

export function parseStatus(value: unknown): SensorStatus {
  if (value === 1 || value === '1' || value === true) return 1;
  if (value === 0 || value === '0' || value === false) return 0;
  throw new Error('A API retornou um status inválido para o sensor.');
}

export function parseSensorList(payload: unknown): Sensor[] {
  const root = object(payload);
  if (!Array.isArray(root.data)) {
    throw new Error('A resposta da listagem não contém o array "data".');
  }
  const seen = new Set<string>();
  const sensors = root.data.map((raw): Sensor => {
    const row = object(raw);
    const codigo = typeof row.codigo === 'string' ? row.codigo.trim() : '';
    if (!codigo) throw new Error('A listagem contém um sensor sem código válido.');
    return {
      codigo,
      tipo: typeof row.tipo === 'string' && row.tipo.trim() ? row.tipo.trim() : 'Desconhecido',
      status: parseStatus(row.status),
    };
  });
  return sensors.filter((sensor) => {
    if (seen.has(sensor.codigo)) return false;
    seen.add(sensor.codigo);
    return true;
  }).sort((a, b) => a.codigo.localeCompare(b.codigo, 'pt-BR', { numeric: true }));
}

export function parseSingleStatus(payload: unknown): SensorStatus {
  const root = object(payload);
  if (typeof root.error === 'string') throw new Error(root.error);
  return parseStatus(root.status);
}

export function validateUpdateResponse(payload: unknown, expected: SensorStatus): void {
  const root = object(payload);
  if (typeof root.error === 'string' && root.error.trim()) throw new Error(root.error);
  if (typeof root.message === 'string' && !/atualizad/i.test(root.message)) {
    throw new Error(root.message);
  }
  if ('status' in root && parseStatus(root.status) !== expected) {
    throw new Error('A API não confirmou o status solicitado.');
  }
  if (!('status' in root) && !(typeof root.message === 'string' && /atualizad/i.test(root.message))) {
    throw new Error('A API não confirmou a atualização do sensor.');
  }
}
