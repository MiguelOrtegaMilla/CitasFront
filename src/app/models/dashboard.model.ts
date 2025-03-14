export interface DashboardMetrics {
  totalCurrentMonthRevenue: number;                                             // Ganancias totales del mes actual
  totalCurrentMonthAppointments: number;                                        // Citas establecidas totales del mes actual
  busiestHours: { hour: string; count: number }[];                              // Horas más concurridas globales
  mostRequestedServices: { serviceName: string; count: number }[];              // Servicios más solicitados globales
  weeklyAppointments: { day: string; count: number }[];                          // Días de la semana con citas globales
}  

