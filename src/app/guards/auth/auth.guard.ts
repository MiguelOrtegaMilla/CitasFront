import { CanActivateFn , Router} from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // Permitir acceso
  } else {
    router.navigate(['/login']); // Redirigir a la página de inicio de sesión
    return false; // Denegar acceso
  }
  
};
