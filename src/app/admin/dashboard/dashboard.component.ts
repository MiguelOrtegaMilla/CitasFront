import { Component , OnInit, ViewChild } from '@angular/core';
import { ChartOptions, ChartData, Chart } from 'chart.js';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { DashboardMetricsResponseDTO } from '../../models/Metrics/DashboardMetricsResponseDTO.model';





@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule , FormsModule , BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  metrics: DashboardMetricsResponseDTO | undefined;

  startDate: string = '';
  endDate: string = '';


  public weeklyAppointmentsData: ChartData<'line'> = {
    labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    datasets: [{
      label: 'Citas por dia de la semana',
      data: [],
      borderColor: '#007BFF',
      backgroundColor: 'rgba(0, 123, 255, 0.5)',
      fill: true
    }]
  };

  public weeklyAppointmentsOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } },
    animation: {
      easing: 'easeInOutCubic', // Transición suave en los cambios
      duration: 1500
    }
  };

  public popularServicesChartData: ChartData<'bar'> = {
    labels: [], // Nombres de servicios
    datasets: [{
      label: 'Servicios Más Demandados',
      data: [], // Cantidad de veces que se ha solicitado cada servicio
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }]
  };

  public popularServicesChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: { y: { beginAtZero: true } }
  };

  public peakHoursChartData: ChartData<'bar'> = {
    labels: [], // Horas más concurridas se llenarán dinámicamente
    datasets: [{
      label: 'Horas mas concurridas',
      data: [], // Datos se llenarán dinámicamente
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };

  public peakHoursChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: { y: { beginAtZero: true } }
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.dashboardService.getMetrics().subscribe({
      next: (metrics: DashboardMetricsResponseDTO) => {
        this.metrics = metrics;
        this.updateCharts(metrics);
      },
      error: (error) => {
        console.error('Error al cargar las métricas:', error);
      }
    });
  }

  // Actualizar los gráficos en base a los datos completos de citas
  updateCharts(metrics:DashboardMetricsResponseDTO): void {
    
    // Configurar los datos del gráfico weeklyAppointments
    this.weeklyAppointmentsData.datasets[0].data = metrics.appointmentsPerDay.map(day => day.count);
    this.weeklyAppointmentsData.labels = metrics.appointmentsPerDay.map(day => day.day);

    // Configurar los datos del gráfico peakHours
    this.peakHoursChartData.labels = this.metrics?.peakHours.map(peakHour => peakHour.hour) || [];
    this.peakHoursChartData.datasets[0].data = this.metrics?.peakHours.map(peakHour => peakHour.count) || [];

    // Configurar los datos del gráfico popularServices
    this.popularServicesChartData.labels = this.metrics?.popularServices.map(service => service.serviceName);
    this.popularServicesChartData.datasets[0].data = this.metrics?.popularServices.map(service => {
      return service.count ?? 0;  // Si `count` es undefined o null, retorna 0
    }) || [];

  }

  applyDateFilter(): void {
    if (this.startDate && this.endDate) {
      this.dashboardService.getMetricsByDateRange(this.startDate, this.endDate).subscribe((metrics) => {

        // Actualiza las métricas y datos de gráficos según el rango de fechas
        this.metrics = metrics;

        // Actualizar los datos del gráfico si es necesario
        this.weeklyAppointmentsData.labels = this.metrics.appointmentsPerDay.map(appointment => appointment.day);
        this.weeklyAppointmentsData.datasets[0].data = this.metrics?.appointmentsPerDay.map(appointment => appointment.count);

        this.popularServicesChartData.labels = this.metrics?.popularServices.map(service => service.serviceName);
        this.popularServicesChartData.datasets[0].data = this.metrics?.popularServices.map(service => {
          return service.count ?? 0;  // Si `count` es undefined o null, retorna 0
        }) || [];

        this.peakHoursChartData.labels = metrics.peakHours.map(hour => hour.hour);
        this.peakHoursChartData.datasets[0].data = metrics.peakHours.map(hour => hour.count);
      });

    }
  }

}
