import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { delay, filter } from 'rxjs';
import { MaterialModule } from '../../../../module/Material.module';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MenuheaderComponent } from '../../menuheader/menuheader.component';




@UntilDestroy()

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, 
    CommonModule,
    RouterLink,
    RouterOutlet,
    MaterialModule,
    MenuheaderComponent, ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

   // Variable pour stocker l'option sélectionnée
   contratSelectionne: string | undefined;

  constructor(private observer: BreakpointObserver, private router: Router) {}

  ngAfterViewInit() {
    this.observer
      .observe(['(max-width: 800px)'])
      .pipe(delay(1), untilDestroyed(this))
      .subscribe((res) => {
        if (res.matches) {
          this.sidenav.mode = 'over';
          this.sidenav.close();
        } else {
          this.sidenav.mode = 'side';
          this.sidenav.open();
        }
      });

    this.router.events
      .pipe(
        untilDestroyed(this),
        filter((e) => e instanceof NavigationEnd)
      )
      .subscribe(() => {
        if (this.sidenav.mode === 'over') {
          this.sidenav.close();
        }
      });
  }

    // Simule les données récupérées depuis la base de données
    optionsContrats = [
      { valeur: 'contrat1', affichage: 'Contrat Type 1' },
      { valeur: 'contrat2', affichage: 'Contrat Type 2' },
      // Ajoutez autant d'options que nécessaire
    ];
  
}
