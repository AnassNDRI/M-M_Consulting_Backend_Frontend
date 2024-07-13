import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription, filter } from 'rxjs';
import { MaterialModule } from '../../../module/Material.module';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    RouterLink,
    MaterialModule,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  private destroy$ = new Subject<void>(); // Utilisé pour la désinscription propre à la destruction

  footerVisible: boolean = true; // Ajout de la propriété pour la visibilité du logo

  constructor(
    private router: Router, // Service de routage pour la navigation
    private cdr: ChangeDetectorRef // Référence pour détecter les changements,
  ) {}

  // Initialisation du composant: configure et gère les souscriptions aux services nécessaires
  ngOnInit(): void {
    const routerSubscription = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        this.footerVisible = !event.url.startsWith('/candidate-cv-viewer') // sur la page Cv viewer
                           && !event.url.startsWith('/dashboard'); // invisible sur la page Admin
        this.cdr.detectChanges();
      });

    this.subscriptions.add(routerSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Properly clean up all subscriptions
  }
}
