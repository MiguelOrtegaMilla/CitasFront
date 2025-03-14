import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthResponseDTO } from '../../models/Auth/AuthResponseDTO.model';
import { AuthRequestDTO } from '../../models/Auth/AuthRequestDTO.model';
import { UserRequestDTO } from '../../models/Users/UserRequestDTO.model';
import { Role } from '../../models/Enumeraciones/role.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8080/admin/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<String> {

    const authRequest: AuthRequestDTO = { username, password };
    
    return this.http.post<AuthResponseDTO>(`${this.baseUrl}/login`,authRequest)
      .pipe(
        map(response => {
          if (response.token ) {
            this.setToken(response.token);

            const role = this.getRoleFromToken();

            if (!role) throw new Error('No se pudo obtener el rol del token.');
            localStorage.setItem('role', role);

            return response.token;
          }
          throw new Error('Login failed');
        }),
        catchError(this.handleError)
      );
  }

  register(userRequestDTO:UserRequestDTO): Observable<void> {
    if (
      !this.isValidEmail(userRequestDTO.email) || 
      !this.isValidPassword(userRequestDTO.password) || 
      !this.isValidUsername(userRequestDTO.name) || 
      !this.isValidPhoneNumber(userRequestDTO.phone)
      ) {
      return throwError(() => new Error('Invalid registration data'));
    }

    return this.http.post<void>(`${this.baseUrl}/singup`,userRequestDTO)
      .pipe(
        map(() => {
            console.log('Register successful');
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !this.isTokenExpired(token);
  }

  isAdmin(): boolean {
    const role = this.getRoleFromToken();
    return role === Role.ADMIN;
  }

  getCurrentUser() : { uuid: string; role: Role } | null {
    return this.getUserFromToken();
  }

  getRoleFromToken(): Role | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role as Role;
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  refreshToken(): Observable<string> {
    return this.http.post<{ token: string }>(`${this.baseUrl}/refresh-token`, {})
      .pipe(
        map(response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            return response.token;
          }
          throw new Error('Token refresh failed');
        }),
        catchError(this.handleError)
      );
  }


  private getUserFromToken(): { uuid: string; role: Role } | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
  
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      uuid: payload.sub,
      role: payload.role as Role,
    };
  }

  private isTokenExpired(token: string): boolean {
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    return password.length >= 8;
  }

  private isValidUsername(username: string): boolean {
    return username.length >= 3 && username.length <= 20;
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
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

}
