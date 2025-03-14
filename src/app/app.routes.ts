import { Routes } from '@angular/router';
import { authGuard } from './guards/auth/auth.guard';
import { adminGuard } from './guards/admin/admin.guard';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CitasComponent } from './admin/citas/citas.component';
import { CitasUsuarioComponent } from './user/citas-usuario/citas-usuario.component';
import { AuthComponent } from './user/auth/auth.component';
import { HomeComponent } from './front/home/home.component';
import { ServiciosAdminComponent } from './admin/servicios-admin/servicios-admin.component';
import { ResumenCitaComponent } from './front/resumen/resumen-cita/resumen-cita.component';
import { ForbbidenComponent } from './front/forbbiden/forbbiden.component';

export const routes: Routes = [

    {
        path: 'dashboard',
        component: DashboardComponent,
        
    },

    {
        path: 'citas-admin',
        component: CitasComponent,

    },

    {
        path: 'login',
        component: AuthComponent, // Componente de inicio de sesión
    },

    {
        path: 'reserva',
        component: CitasUsuarioComponent, 
    },

    {
        path: '',
        component: HomeComponent, 
    },

    {
        path: 'servicios-admin',
        component: ServiciosAdminComponent, 
    },

    {
        path: 'resumen-cita',
        component: ResumenCitaComponent, 
    },
    {
        path: 'forbbiden',
        component: ForbbidenComponent,
    }

];
