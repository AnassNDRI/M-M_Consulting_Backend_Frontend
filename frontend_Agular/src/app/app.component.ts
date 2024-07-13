import { CommonModule, DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  CalendarNativeDateFormatter,
  DateFormatterParams,
} from 'angular-calendar';
import { DashboardComponent } from './component/administrator/dashboard/dashboard.component';
import { SidebarComponent } from './component/administrator/sidebar/sidebar.component';
import { FooterComponent } from './component/footer/footer.component';
import { MenuheaderComponent } from './component/menuheader/menuheader.component';
import { AuthentificationService } from './component/security/service/authServiceIndex';
import { GlobalTranslateModule } from './global-translate.module';
import { HttpInterceptorService } from './shared/service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    GlobalTranslateModule, // Module pour la traduction internationale
    CommonModule, // Fournit des directives et des pipes communs comme ngIf et ngFor
    FormsModule, // Module pour travailler avec les formulaires dans Angular
    FontAwesomeModule, // Module pour intégrer les icônes FontAwesome
    RouterOutlet, // Directive permettant d'afficher le contenu des routes
    RouterLink,
    MenuheaderComponent,
    SidebarComponent,
    DashboardComponent,
    FooterComponent,
  ],
  providers: [
    // Services et valeurs que ce composant ou ses enfants peuvent utiliser
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true,
    }, // Ajout de mon ntercepteur personnalisé (HttpInterceptorService)
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS }, // Fournit une valeur pour JWT_OPTIONS
    JwtHelperService, // Service pour gérer les opérations JWT
    DatePipe, // Pipe pour formater les dates
   
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'MM_Consulting';

  constructor(
    private authService: AuthentificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verification de l'etat de la connexion au demarrage de l'application
    this.checkAuthentication();
  }

  private checkAuthentication(): void {
    if (this.authService.isValidToken()) {
      this.authService.isAuthenticated$.next(true);

      // On récupére les informations de l'utilisateur à partir du token
      const decodedToken = this.authService.getDecodedToken();
      if (decodedToken) {
        // On restaure les autres informations d'utilisateur si nécessaire
        this.authService.setUserName(decodedToken.name);
        this.authService.setUserFirstName(decodedToken.firstname);
      }
    }
  }
}
