import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CitasComponent } from "./admin/citas/citas.component";
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CitasUsuarioComponent } from './user/citas-usuario/citas-usuario.component';
import { HeaderComponent } from './front/header/header.component';
import { FooterComponent } from './front/footer/footer.component';
import { HomeComponent } from './front/home/home.component';
import { BaseChartDirective } from 'ng2-charts';
import { ServiciosAdminComponent } from "./admin/servicios-admin/servicios-admin.component";
import { EditCitasModalComponent } from "./modals/edit-citas-modal/edit-citas-modal.component";
import { filter } from 'rxjs';
import { AuthComponent } from "./user/auth/auth.component";
import { CitasModalComponent } from "./modals/citas-modal/citas-modal.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ 
    RouterOutlet, HeaderComponent, FooterComponent, 
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CitasV2';

  constructor( private router:Router){
  }

  showParallax = true;

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showParallax = !event.url.includes('/citas-usuario');
    });
  }
}
