import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, Observable, retry, throwError, timeout } from 'rxjs';
import { Servicios } from '../../models/servicios.model';
import { ServiceResponseDTO } from '../../models/Service/ServiceResponseDTO.model';
import { ServiceRequestDTO } from '../../models/Service/ServiceRequestDTO.model';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {

  private baseUrl = 'http://localhost:8080/admin/services';

  constructor(private http: HttpClient) { }

  getAllServices(page: number = 1, limit: number = 10): Observable<{ services: ServiceResponseDTO[], total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<{ services: ServiceResponseDTO[], total: number }>((`${this.baseUrl}/list`), { params })
      .pipe(
        retry(3),
        timeout(10000),
        catchError(this.handleError)
      );
  }

  getServiceById(uuid: string): Observable<ServiceResponseDTO> {
    return this.http.get<ServiceResponseDTO>(`${this.baseUrl}/${uuid}`)
      .pipe(
        retry(3),
        timeout(10000),
        catchError(this.handleError)
      );
  }

  createService(serviceData: ServiceRequestDTO): Observable<ServiceResponseDTO> {
    this.validateServiceData(serviceData);
    return this.http.post<ServiceResponseDTO>(this.baseUrl, serviceData)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateService(uuid: string, serviceData: ServiceRequestDTO): Observable<ServiceResponseDTO> {
    this.validateServiceData(serviceData, true);
    return this.http.put<ServiceResponseDTO>(`${this.baseUrl}/${uuid}`, serviceData)
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteService(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${uuid}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  searchServices(query: string): Observable<Servicios[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Servicios[]>(`${this.baseUrl}/search`, { params })
      .pipe(
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

  private validateServiceData(data: Partial<Servicios>, isUpdate: boolean = false) {
    if (!isUpdate && !data.name) {
      throw new Error('Service name is required');
    }
    if (data.price !== undefined && data.price < 0) {
      throw new Error('Price must be a positive number');
    }
    if (data.duration !== undefined && data.duration <= 0) {
      throw new Error('Duration must be a positive number');
    }
  }
}
