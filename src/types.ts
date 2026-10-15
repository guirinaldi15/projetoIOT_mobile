export type SensorStatus = 0 | 1;
export type Sensor = {
  codigo: string;
  tipo: string;
  status: SensorStatus;
};
