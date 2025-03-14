import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ElementRef, Renderer2, HostListener} from '@angular/core';
import { ReseñasService } from '../../services/reseñas/reseñas.service';
import { AuthService } from '../../services/auth/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule , RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit , OnDestroy{

  isMobile: boolean = false;
  isVisible: boolean = false;
  isAdmin: boolean = false;

  private scrollListener: () => void = () => {};
  private resizeListener: () => void = () => {};

  reviews: any[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  placeId: string = 'TU_PLACE_ID_DE_GOOGLE';

  constructor(
    private el: ElementRef, private renderer: Renderer2 , private reseñasService: ReseñasService , private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkScreenSize();
    this.scrollListener = this.renderer.listen('window', 'scroll', () => {
      this.handleParallax();
    });

    this.setParallaxHeight();
    this.handleParallax();

    // Add resize listener
    this.resizeListener = this.renderer.listen('window', 'resize', () => {
      this.checkScreenSize();
      this.setParallaxHeight();
      this.handleParallax();
    });

    this.fetchReviews();

    this.isAdmin = this.authService.isAdmin();
  }

  ngOnDestroy() {
    if (this.scrollListener) {
      this.scrollListener();
    }
    if (this.resizeListener) {
      this.resizeListener();
    }
  }

  private handleParallax() {
    if (window.innerWidth >= 768) {
      const scrolled = window.scrollY;
      const parallaxBg = this.el.nativeElement.querySelector('.parallax-bg');
      const parallaxSpeed = 0.3; // Adjusted for smoother effect
      this.renderer.setStyle(parallaxBg, 'transform', `translateY(${scrolled * parallaxSpeed}px)`);
    }
  }

  private setParallaxHeight() {
    const container = this.el.nativeElement.querySelector('.parallax-container');
    const aspectRatio = 1331 / 1920; // Image height / width
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;
    this.renderer.setStyle(container, 'height', `${containerHeight}px`);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    this.isVisible = !this.isMobile;
  }

  fetchReviews(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.reseñasService.getReviews(this.placeId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      },
    });
  }

}
