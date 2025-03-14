import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, Observable, retry, throwError, timeout } from 'rxjs';
import { Appointment } from '../../models/cita.model'; 
import { AppointmentRequestDTO } from '../../models/Appointment/AppointmentRequestDTO.model';
import { AppointmentResponseDTO } from '../../models/Appointment/AppointmentResponseDTO.model';
import { ServiceResponseDTO } from '../../models/Service/ServiceResponseDTO.model';

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private baseUrl = 'http://localhost:8080/appointments'; // Reemplaza con tu URL base

  constructor(private http: HttpClient) {}

  getCitas(): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(this.baseUrl).pipe(
      retry(3),
      timeout(10000),
      catchError(this.handleError)
    );
  }

  getCitasById(uuid: string): Observable<AppointmentResponseDTO> {
    if (!uuid) {
      return throwError(() => new Error('Invalid appointment UUID'));
    }
    return this.http.get<AppointmentResponseDTO>(`${this.baseUrl}/reserva/${uuid}`).pipe(
      retry(3),
      timeout(10000),
      catchError(this.handleError)
    );
  }

  createCita(appointmentData: AppointmentRequestDTO): Observable<AppointmentResponseDTO> {
    if (!this.validateAppointmentData(appointmentData)) {
      return throwError(() => new Error('Invalid appointment data'));
    }
    return this.http.post<AppointmentResponseDTO>(`${this.baseUrl}/users/create`, appointmentData).pipe(
      catchError(this.handleError)
    );
  }

  updateCita(uuid: string, appointmentData: AppointmentRequestDTO): Observable<AppointmentResponseDTO> {
    if (!uuid) {
      return throwError(() => new Error('Invalid appointment UUID'));
    }
    if (!this.validateAppointmentData(appointmentData, true)) {
      return throwError(() => new Error('Invalid appointment data'));
    }
    return this.http.put<AppointmentResponseDTO>(`${this.baseUrl}/admin/${uuid}`, appointmentData).pipe(
      catchError(this.handleError)
    );
  }

  //borrar cita como admin
  deleteCita(uuid: string): Observable<void> {
    if (!uuid) {
      return throwError(() => new Error('Invalid appointment ID'));
    }
    return this.http.delete<void>(`${this.baseUrl}/admin/${uuid}`).pipe(
      catchError(this.handleError)
    );
  }

  //buscar las citas de un usuario como admin (no hecho)
  getUserAppointments(uuid:string): Observable<AppointmentResponseDTO[]> {

    if(!uuid) {
      return throwError(() => new Error('Invalid user ID'));
    }

    return this.http.get<AppointmentResponseDTO[]>(`${this.baseUrl}/user/${uuid}`).pipe(
      retry(3),
      timeout(10000),
      catchError(this.handleError)
    );
  }

  //borrar citas como usuario (cancelarlas)
  cancelAppointment(uuid: string): Observable<void> {
    if (!uuid) {
      return throwError(() => new Error('Invalid appointment ID'));
    }
    return this.http.delete<void>(`${this.baseUrl}/users/cancel/${uuid}`).pipe(
      catchError(this.handleError)
    );
  }

  //TODO de este metodo deberia de encargarse el serviciosService
  getServicios(): Observable<ServiceResponseDTO[]> {
    return this.http.get<ServiceResponseDTO[]>(`${this.baseUrl}/servicios`).pipe(
      retry(3),
      timeout(10000),
      catchError(this.handleError)
    );
  }

  getAppointmentsByDatetime(datetime: string): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.baseUrl}/by-datetime?datetime=${datetime}`);
  }

  checkAvailability(dateTime: string, duration: number): Observable<boolean> {
    if (!this.isValidDateTime(dateTime) || !this.isValidDuration(duration)) {
      return throwError(() => new Error('Invalid date time or duration'));
    }
    const params = new HttpParams()
      .set('dateTime', dateTime)
      .set('duration', duration.toString());

    return this.http.get<boolean>(`${this.baseUrl}/check-availability`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getOccupiedTimes(): Observable<{ start: string; end: string }[]> {
    return this.http.get<{ start: string; end: string }[]>(`${this.baseUrl}/occupied-times`).pipe(
      retry(3),
      timeout(10000),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private validateAppointmentData(data: Partial<Appointment>, isUpdate: boolean = false): boolean {
    if (!isUpdate && (!data.dateTime || !data.serviceId || !data.clientId || data.duration === undefined)) {
      return false;
    }
    if (data.dateTime && !this.isValidDateTime(data.dateTime)) {
      return false;
    }
    if (data.duration !== undefined && !this.isValidDuration(data.duration)) {
      return false;
    }
    if (data.status && !['confirmada', 'cancelada'].includes(data.status)) {
      return false;
    }
    return true;
  }

  private isValidDate(date: string): boolean {
    return !isNaN(Date.parse(date));
  }

  private isValidTime(time: string): boolean {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(time);
  }

  private isValidDateTime(dateTime: string): boolean {
    return !isNaN(Date.parse(dateTime));
  }

  private isValidDuration(duration: number): boolean {
    return duration > 0 && duration <= 480;   //Asumiendo que la duracion maxima es de 8h (480 minutes)
  }
  
}
