export interface Appointment {
  id: number;              // ID único de la cita
  clientId: number;        // ID del cliente
  serviceId: number;       // ID del servicio solicitado
  dateTime: string;        // Fecha y hora de inicio en formato ISO
  duration: number;        // Duración de la cita en minutos
  status: string;          // Estado de la cita (e.g., confirmada, cancelada)
  n_recibo: string;
}