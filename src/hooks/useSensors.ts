import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSensorStatus, listSensors, setSensorStatus } from '../api/sensors';
import type { Sensor, SensorStatus } from '../types';

export const sensorKeys = {
  all: ['sensors'] as const,
  list: ['sensors', 'list'] as const,
  detail: (codigo: string) => ['sensors', 'detail', codigo] as const,
};

export const sensorStatusOptions = (codigo: string) => ({
  queryKey: sensorKeys.detail(codigo),
  queryFn: ({ signal }: { signal: AbortSignal }) => getSensorStatus(codigo, signal),
  staleTime: 0,
});

export function useSensors() {
  return useQuery({
    queryKey: sensorKeys.list,
    queryFn: ({ signal }) => listSensors(signal),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
  });
}

export function useSensorStatus(codigo: string) {
  return useQuery({
    ...sensorStatusOptions(codigo),
    enabled: codigo.length > 0,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
}

export function useUpdateSensorStatus() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: ({ codigo, status }: { codigo: string; status: SensorStatus }) =>
      setSensorStatus(codigo, status),
    onSuccess: (status, { codigo }) => {
      cache.setQueryData<Sensor[]>(sensorKeys.list, (old) =>
        old?.map((sensor) => sensor.codigo === codigo ? { ...sensor, status } : sensor),
      );
      cache.setQueryData(sensorKeys.detail(codigo), status);
      void cache.invalidateQueries({ queryKey: sensorKeys.all });
    },
  });
}
