import { Injectable } from '@angular/core';
import { HttpClient , HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, retry, throwError, timeout } from 'rxjs';
import { DashboardMetricsResponseDTO } from '../../models/Metrics/DashboardMetricsResponseDTO.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:8080/admin/metrics';

  constructor(private http: HttpClient) { }

  getMetrics(): Observable<DashboardMetricsResponseDTO> {
    return this.http.get<DashboardMetricsResponseDTO>(`${this.apiUrl}/all`).pipe(
      retry(3),
      timeout(10000),
      catchError(this.handleError)
    );
  }

  getMetricsByDateRange(startDate: string, endDate: string): Observable<DashboardMetricsResponseDTO> {
    if (!this.isValidDateFormat(startDate) || !this.isValidDateFormat(endDate)) {
      return throwError(() => new Error('Invalid date format. Use YYYY-MM-DD.'));
    }

    if (new Date(startDate) > new Date(endDate)) {
      return throwError(() => new Error('Start date must be before or equal to end date.'));
    }

    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<DashboardMetricsResponseDTO>(`${this.apiUrl}/metrics-by-date`, { params }).pipe(
      retry(3),
      timeout(10000),
      catchError(this.handleError)
    );
  }

  
  getMetricsComparison(
    currentStartDate: string, 
    currentEndDate: string, 
    previousStartDate: string, 
    previousEndDate: string)
    : Observable<{current: DashboardMetricsResponseDTO, previous: DashboardMetricsResponseDTO}> {
    return forkJoin({
      current: this.getMetricsByDateRange(currentStartDate, currentEndDate),
      previous: this.getMetricsByDateRange(previousStartDate, previousEndDate)
    }).pipe(catchError(this.handleError));
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

  private isValidDateFormat(date: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(date);
  }
}
