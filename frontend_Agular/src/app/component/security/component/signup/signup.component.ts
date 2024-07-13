import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SigninPayloadd } from '../../model/payload/signin.payload-copy';
import { AuthentificationService } from '../../service/authServiceIndex';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule, // Pour utiliser les formulaires réactifs dans l'application.
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit {
  email: string = 'consultant@mail.com';
  password: string = 'StrongPassword123';
  constructor(public auth: AuthentificationService) {}

  ngOnInit(): // Supposons que ceci est dans votre composant de connexion après avoir reçu une réponse positive du backend
  //this.authService.saveToken(response.accessToken); // Sauvegarde le token
  //this.authService.redirectToProfile(); // Redirige l'utilisateur

  void {}

  signin() {
    const payload: SigninPayloadd = {
      email: this.email,
      password: this.password,
    };
    this.auth.signin(payload).subscribe();
  }
}
