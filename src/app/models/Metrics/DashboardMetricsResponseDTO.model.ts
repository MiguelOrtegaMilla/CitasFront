export interface DashboardMetricsResponseDTO{
    
    peakHours:{
        hour:string
        count:number
    }[];

    popularServices:{
        serviceName:string
        count:number
    }[];

    appointmentsPerDay:{
        day:string
        count:number
    }[];

    currentMonthEarnings:number;

    totalAppointmentsCurrentMonth:number;
}

//DTO usado para obtener los resultados de las metricas desde el backend