import { CommonModule } from '@angular/common';
import { Component, HostListener} from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule , RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css' 
})
export class HeaderComponent {

  isSticky: boolean = false;
  isMobile: boolean = false;
  isVisible: boolean = false;
  isAdmin: boolean = false;

  constructor(private authService: AuthService){}

  ngOnInit() {
    this.checkScreenSize();
    this.isAdmin = this.authService.isAdmin();
  }

  @HostListener('window:scroll', ['$event'])
  handleScroll() {
    const windowScroll = window.scrollY;
    const parallaxHeight = window.innerHeight; // Asumimos que la sección de parallax tiene 100vh

    if (windowScroll >= parallaxHeight) {
      this.isSticky = true;
      this.isVisible = true;
    } else {
      this.isSticky = false;
      this.isVisible = this.isMobile;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    this.isVisible = this.isMobile;
  }

}