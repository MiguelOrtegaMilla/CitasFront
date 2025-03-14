import { Component , Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CitasService } from '../../services/citas/citas.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServiciosService } from '../../services/servicios/servicios.service';
import { Router } from '@angular/router';
import { tap, catchError, of, finalize } from 'rxjs';
import { ServiceResponseDTO } from '../../models/Service/ServiceResponseDTO.model';
import { AuthService } from '../../services/auth/auth.service';
import { AppointmentRequestDTO } from '../../models/Appointment/AppointmentRequestDTO.model';

//modal para crear citas (usuarios)

@Component({
  selector: 'app-citas-modal',
  standalone: true,
  imports: [FormsModule , CommonModule],
  templateUrl: './citas-modal.component.html',
  styleUrl: './citas-modal.component.css'
})
export class CitasModalComponent {

  @Input() dateTime?: string; // Fecha seleccionada

  services: ServiceResponseDTO[] = [];
  isAvailable: boolean | null = null;
  serviceError: string | null = null;
  availabilityError: string | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  selectedServiceUuid: string | null = null;
  
  endDateTime: string | null = null;

  constructor(
    public activeModal: NgbActiveModal,
    private citasService: CitasService,
    private serviciosService: ServiciosService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.isLoading = true;
    this.serviciosService.getAllServices().pipe(
      tap((response) => {
        this.services = response.services;
      }),
      catchError((error) => {
        this.errorMessage = 'Error al cargar los servicios. Por favor, inténtalo de nuevo.';
        return of(null);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe();
  }

  saveAppointment(): void {
    if (!this.validateForm()) {
      return;
    }

    const currentUserUuid = this.authService.getCurrentUser()?.uuid;

    this.isLoading = true;

    const appointmentRequest: AppointmentRequestDTO = {
      userUuid:currentUserUuid!,
      serviceUuid: this.selectedServiceUuid!,
      dateTime: this.dateTime!
    };

   this.citasService.createCita(appointmentRequest).pipe(
      tap(() => {
        this.successMessage = 'Cita creada con éxito.';
        setTimeout(() => this.activeModal.close('created'), 1500);
      }),
      catchError(() => {
        this.errorMessage = 'Error al crear la cita.';
        return of(null);
      }),
      finalize(() => (this.isLoading = false))
    ).subscribe();
  }

  private validateForm(): boolean {

    if (!this.selectedServiceUuid) {
      this.serviceError = "Por favor selecciona un servicio para continuar.";
      return false;
    }
    if (!this.isAvailable) {
      this.availabilityError = "El horario seleccionado no está disponible.";
      return false;
    }
    if (!this.dateTime) {
      this.errorMessage = "Información de la cita incompleta.";
      return false;
    }
    return true;
  }

  getFormattedDate(): string {
    const start = this.dateTime ? new Date(this.dateTime) : null;
    const end = this.endDateTime ? new Date(this.endDateTime) : null;

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit', minute: '2-digit'
    };

    if (start && end) {
      return `${start.toLocaleString('es-ES', options)} - ${end.toLocaleString('es-ES', timeOptions)}`;
    } else if (start) {
      return start.toLocaleString('es-ES', options);
    } else {
      return 'Fecha no seleccionada';
    }
  }

}
