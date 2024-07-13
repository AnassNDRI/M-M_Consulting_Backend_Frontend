import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiResponse } from '../../../../shared/model';
import { NavigationService } from '../../../../shared/service';
import { HandleErrorBase } from '../../../shared/HandleErrorBase';
import { SigninResponse } from '../../model/response/indexResponse';
import { TokenService } from '../../service/authServiceIndex';
import { AuthentificationService } from '../../service/authentification.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, switchMap, of } from 'rxjs';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule, // Pour utiliser les formulaires réactifs dans l'application.
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css',
})
export class SigninComponent extends HandleErrorBase implements OnInit {
  errorMessage: string | null = null; // Pour stocker le message d'erreur
  loginForm!: FormGroup; // FormGroup pour gérer le formulaire de connexion et Initialiser avant son utilisation.

  constructor(
    private formBuilder: FormBuilder, // Service Angular pour construire des formulaires réactifs.
    private navigateService: NavigationService, // Service pour la navigation sécurisée selon le rôle de l'utilisateur.
    private tokenService: TokenService, // Service pour gérer le stockage des tokens JWT.
    private authService: AuthentificationService, // Service d'authentification pour se connecter.
    private router: Router, // Ajoutez ceci
    private route: ActivatedRoute, // Et ceci
    public translateService: TranslateService // Service pour l'internationalisation et la traduction des messages.
  ) {
    super(translateService);
  }

  // Méthode exécutée à l'initialisation du composant.
  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    // Initialisation du formulaire avec des champs et des validations.
    this.loginForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.maxLength(70),
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      password: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   Methode privée  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  login @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // Méthode pour la connexion de l'utilisateur.
  login(): void {
    if (this.loginForm.valid) {
      // Si le formulaire est valide, procède à la connexion.
      const payload = this.loginForm.value; // Récupère les données du formulaire.
      this.authService.signin(payload).subscribe({
        next: (response: ApiResponse) => {
          // On vérifie la structure correcte de la réponse
          if (response.result) {
            // On caste `response.data` au type `SigninResponse`
            //("Traite `response.data` comme étant de type `SigninResponse`".)
            const signinResponse: SigninResponse =
              response.data as SigninResponse;
            // On sauvegarde les tokens dans le service de gestion des tokens pour une utilisation future.
            this.tokenService.saveToken(signinResponse.token.accessToken);
            this.tokenService.saveRefreshToken(
              signinResponse.token.refreshToken
            );
            // On met à jour le nom et le prénom de l'utilisateur connecté pour l'affichage.
            this.authService.setUserName(signinResponse.user.name);
            this.authService.setUserFirstName(signinResponse.user.firstname);

            this.navigateService.navigateToSecure(signinResponse.user.role);

            // On récupère returnUrl depuis les queryParams
           /* const returnUrl = this.route.snapshot.queryParams['returnUrl'];

            // Si returnUrl est spécifié, naviguer vers cette URL.
            // Sinon, utiliser navigateService.navigateToSecure pour diriger l'utilisateur selon son rôle.
            if (returnUrl) {
              this.router.navigateByUrl(returnUrl)
            } else {
              // Redirection par défaut si aucun returnUrl n'est spécifié
             
             
            } */
          }
        },
        error: (errorResponse: ApiResponse) => {
          // Utilisation de la classe Base "handleError" pour gerer les erreurs
          this.errorMessage = this.handleError(errorResponse);
        },
      });
    }
  }


 










  // Méthodes pour obtenir facilement l'accès aux champs du formulaire dans le template HTML.
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }


}
