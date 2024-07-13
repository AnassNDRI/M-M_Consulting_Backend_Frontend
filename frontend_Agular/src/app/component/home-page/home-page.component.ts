import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule} from '@ngx-translate/core';
import { MaterialModule } from '../../../module/Material.module';
import { NavigationService } from '../../shared/service';
import { AuthentificationService } from '../security/securityIndex';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MaterialModule,
    FormsModule,
    TranslateModule,
    MatDialogModule,
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent {

  
  constructor(
    private router: Router, // Service de routage pour la navigation
    public navigationService: NavigationService,
    private authService: AuthentificationService // Service d'authentification
  ) {
  }


   // Redirige vers la page de connexion
   goToProfileRecruiter() {
    this.router.navigate(['/recruiter-profile']);
  }

  // Redirige vers la page d'inscription
  goToJobListing() {
    this.router.navigate(['/joblisting-list']);
  }


}
