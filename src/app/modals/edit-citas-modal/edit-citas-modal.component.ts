import { Component , Input , OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CitasService } from '../../services/citas/citas.service';
import { Appointment } from '../../models/cita.model';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../models/user.model';
import { Servicios } from '../../models/servicios.model';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiciosService } from '../../services/servicios/servicios.service';
import { Router } from '@angular/router';
import { tap, catchError, of, finalize } from 'rxjs';
import { ServiceResponseDTO } from '../../models/Service/ServiceResponseDTO.model';
import { AppointmentResponseDTO } from '../../models/Appointment/AppointmentResponseDTO.model';
import { AppointmentRequestDTO } from '../../models/Appointment/AppointmentRequestDTO.model';

//modal para editar citas (administrador)

@Component({
  selector: 'app-edit-citas-modal',
  standalone: true,
  imports: [CommonModule , ReactiveFormsModule],
  templateUrl: './edit-citas-modal.component.html',
  styleUrl: './edit-citas-modal.component.css'
})
export class EditCitasModalComponent implements OnInit{

  @Input() appointmentUuid?: string; // ID de la cita para cargar datos
  @Input() dateTime?: string; // Fecha seleccionada

  editForm: FormGroup;
  services: ServiceResponseDTO[] = []; // Servicios disponibles
  isAvailable: boolean | null = null;
  serviceError: string | null = null;
  availabilityError: string | null = null;
  successMessage: string | null = null; 
  showSuccessMsg: boolean = false;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  endDateTime: string | null = null; // Hora de fin del intervalo o servicio

  constructor (
    public activeModal: NgbActiveModal ,
     private citasService: CitasService ,
     private serviciosService: ServiciosService ,
     private router: Router,
     private fb: FormBuilder,
    ) {
      this.editForm = this.fb.group({
        serviceName: ['', Validators.required],
        clientName: ['', [Validators.required, Validators.minLength(2)]],
        dateTime: ['', Validators.required],
      });
    }

  ngOnInit(): void {
    this.loadServices();
    if (this.appointmentUuid) {
      this.loadAppointment(this.appointmentUuid);
    }
  }

  loadServices(): void {
    this.isLoading = true;
    this.serviciosService.getAllServices().pipe(
      tap((response) => {
        this.services = response.services;
      }),
      catchError((error) => {
        this.errorMessage = 'Error al cargar los servicios. Por favor, inténtalo nuevamente.';
        return of(null);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe();
  }

  //TODO Por aqui me he quedao

  loadAppointment(uuid: string): void {
    this.isLoading = true;
    this.citasService.getCitasById(uuid).pipe(
      tap((appointment) => {
        this.editForm.patchValue({
          serviceName: appointment.serviceName,
          clientName: appointment.userName,
          dateTime: appointment.dateTime
        });
        this.calculateEndDateTime(appointment.duration);
      }),
      catchError((error) => {
        this.errorMessage = 'Error al cargar la cita. Por favor, inténtalo nuevamente.';
        return of(null);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe();
  }

  saveAppointment(): void {
    if (this.editForm.invalid) {
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
      return;
    }

    this.isLoading = true;
    const updatedAppointment: AppointmentRequestDTO = this.editForm.value;

    this.citasService.updateCita(this.appointmentUuid!, updatedAppointment).pipe(
      tap(() => {
        this.successMessage = 'Cita actualizada con éxito.';
        setTimeout(() => this.activeModal.close('updated'), 1500);
      }),
      catchError((error) => {
        this.errorMessage = 'Error al actualizar la cita. Por favor, inténtalo nuevamente.';
        return of(null);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe();
  }

  deleteCita(): void {
    if (!confirm('¿Está seguro de que desea eliminar esta cita?')) {
      return;
    }

    this.isLoading = true;
    this.citasService.deleteCita(this.appointmentUuid!).pipe(
      tap(() => {
        this.successMessage = 'Cita eliminada con éxito.';
        setTimeout(() => this.activeModal.close('deleted'), 1500);
      }),
      catchError((error) => {
        this.errorMessage = 'Error al eliminar la cita. Por favor, inténtalo nuevamente.';
        return of(null);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe();
  }

  onServiceChange(): void {
    this.serviceError = null;
    this.availabilityError = null;

    const selectedService = this.services.find(service => service.uuid === this.editForm.get('serviceId')?.value);
    if (selectedService) {
      this.editForm.patchValue({ duration: selectedService.duration });
      this.calculateEndDateTime(selectedService.duration);
      this.checkAvailability(selectedService.duration);
    }
  }

  private checkAvailability(duration: number): void {
    const dateTime = this.editForm.get('dateTime')?.value;

    if (dateTime && duration) {
      this.isLoading = true;
      this.citasService.checkAvailability(dateTime, duration).pipe(
        tap((isAvailable) => {
          this.isAvailable = isAvailable;
          if (!isAvailable) {
            this.availabilityError = 'Este horario no está disponible para el servicio seleccionado. Elija otro.';
          }
        }),
        catchError((error) => {
          this.errorMessage = 'Error al verificar la disponibilidad. Por favor, inténtalo nuevamente.';
          return of(false);
        }),
        finalize(() => this.isLoading = false)
      ).subscribe();
    }
  }

  private calculateEndDateTime(duration: number): void {
    const dateTime = this.editForm.get('dateTime')?.value;
    if (dateTime && duration) {
      const startDate = new Date(dateTime);
      const endDate = new Date(startDate.getTime() + duration * 60000);
      this.endDateTime = endDate.toISOString();
    }
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
      return ''; // Mensaje o formato para cuando no hay fecha seleccionada
    }
  }

}
