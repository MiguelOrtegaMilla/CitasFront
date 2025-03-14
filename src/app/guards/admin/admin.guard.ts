import { CanActivateFn , Router} from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { map, take } from 'rxjs';


export const adminGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

 if (authService.isAdmin()){
    return true; //permitir acceso
 }else {
  router.navigate(['/forbidden']);  //redirigir a pagina de no autorizado
  return false;
 }
};

