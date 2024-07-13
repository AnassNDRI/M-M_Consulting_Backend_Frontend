import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subscription, filter } from 'rxjs';
import { VisibilityStateManagerService } from '../../component/service/visibilityStateManager.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationService implements OnDestroy {
  private subscriptions = new Subscription();
  private subscription = new BehaviorSubject<boolean>(false);
  public isOnAdminPage$ = this.subscription.asObservable(); // C'est un Observable maintenant

  constructor(public router: Router,
    private route: ActivatedRoute,
    private visibilityStateManagerService: VisibilityStateManagerService
  ) {
    // S'abonner aux événements de navigation
    this.subscriptions.add(
      this.router.events
        .pipe(
          // Filtrer pour ne conserver que les événements de fin de navigation
          filter((event) => event instanceof NavigationEnd)
        )
        .subscribe((event) => {
          // Convertir event en type NavigationEnd pour accéder à ses propriétés
          const navigationEndEvent = event as NavigationEnd;

          // On vérifie si l'URL actuelle contient '/dashboard', '/candidate-profile', ou '/recruiter-profile'
          const isOnAdminPage =
            navigationEndEvent.urlAfterRedirects.includes('/dashboard') ||
            navigationEndEvent.urlAfterRedirects.includes(
              '/candidate-profile'
            ) ||
            navigationEndEvent.urlAfterRedirects.includes(
              '/recruiter-profile'
            ) ||
            navigationEndEvent.urlAfterRedirects.includes('/dash');

          // On met à jour le BehaviorSubject avec le résultat
          this.subscription.next(isOnAdminPage);
        })
    );
  }

  navigate(path: string): void {
    this.router.navigate([path]).then();
  }

  navigateToUnsecure(): void {
    this.navigate('/home');
  }

  navigateToLogin(): void {
    this.navigate('/signin');
  }

  navigateToSecure(role: string): void {
    switch (role) {
      case 'Administrator':
      case 'Consultant':
        this.visibilityStateManagerService.restoreState('dashboardState');
        this.router.navigate(['/dashboard']);
        break;
        case 'External':
          this.router.navigate(['/external-profile']);
          break;
      case 'Recruiter':
        this.router.navigate(['/recruiter-profile']);
        break;
      case 'Candidate':
        this.router.navigate(['/candidate-profile']);
        break;
      default:
        this.router.navigate(['/home']);
        break;
    }
  }
/*
  navigateToUserDashboard(userId: number, returnUrl: string): void {
    this.router.navigate(['/users', 'profile', userId], {
      queryParams: { returnUrl },
    });
  }
*/
  ngOnDestroy() {
    // Ensure all subscriptions are cleaned up to prevent memory leaks
    this.subscriptions.unsubscribe();
    this.subscription.unsubscribe();
  }
}
