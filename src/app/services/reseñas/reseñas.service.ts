import { Injectable } from '@angular/core';
import { HttpClient ,HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable ,throwError } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReseñasService {

  private apiKey: string = 'TU_CLAVE_API';
  private baseUrl: string = 'https://maps.googleapis.com/maps/api/place/details/json';

  constructor(private http:HttpClient) { }

  getReviews(placeId: string, language: string = 'es'): Observable<any[]> {
    if (!placeId) {
      return throwError(() => new Error('El Place ID es obligatorio.'));
    }

    const params = new HttpParams()
      .set('place_id', placeId)
      .set('fields', 'reviews')
      .set('key', this.apiKey)
      .set('language', language);

    return this.http.get<any>(this.baseUrl, { params }).pipe(
      retry(3),
      timeout(10000),
      map((response) => {
        if (response.result?.reviews?.length) {
          const reviews = response.result.reviews as any[];
          return reviews;
        } else {
          throw new Error('No se encontraron reseñas para este lugar.');
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // El backend retornó un código de error
      errorMessage = `Código de error ${error.status}, mensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getAverageRating(placeId: string): Observable<number> {
    return this.getReviews(placeId).pipe(
      map(reviews => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / reviews.length;
      })
    );
  }
  
}
