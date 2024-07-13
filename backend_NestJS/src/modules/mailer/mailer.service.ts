import { SendGridService } from '@anchan828/nest-sendgrid';
import { Injectable, NotFoundException } from '@nestjs/common';

import { Historiques } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MailerService {
  constructor(
    private readonly sendGrid: SendGridService,
    private readonly prismaService: PrismaService,
  ) {}

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$ E-MAILS FOR  MODULE USERS  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send Employee Signup Confirmation @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendEmployeeSignupConfirmation(
    email: string,
    name: string,
  ): Promise<void> {
    const emailBody = `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation d'Activation de Compte</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            text-align: center;
          }
          h3 {
            color: #444;
          }
          p {
            margin: 15px 0;
          }
          a {
            display: inline-block;
            background-color: #f4f4f4; 
            color: #007BFF; 
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            border: 2px solid #007BFF;
          } 
          
        </style>
      </head>
      <body>
        <div class="container">
          <h3>Bienvenue dans l'Équipe !</h3>
          <p>Bonjour ${name},</p>
          <p>Nous sommes heureux de vous confirmer l'activation de votre compte collaborateur au sein de l'équipe M&M Consulting.</p>
          <p>Vous faites maintenant partie intégrante de notre équipe et nous sommes impatients de collaborer avec vous.</p>
          <p>Pour consulter votre profil et commencer, veuillez cliquer sur le bouton ci-dessous :</p>
          <a href="https://www.exemple.com/connexion">Voir Mon Profil</a>
          <p>Bienvenue à bord et au plaisir de réaliser ensemble de grands projets !</p>
          <p>Cordialement,</p>
          <p>L'équipe M&M Consulting</p>
        </div>
      </body>
    </html>
  `;
    // On utilisera this.transporter pour envoyer l'email
    await this.sendGrid.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject:
        "Bienvenue dans l'équipe M&M Consulting - Activation de votre compte",
      html: emailBody,
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send Employee Signup Confirmation @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendDeleteAccountConfirmation(
    email: string,
    name: string,
  ): Promise<void> {
    const emailBody = `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation d'Activation de Compte</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            text-align: center;
          }
          h3 {
            color: #444;
          }
          p {
            margin: 15px 0;
          }
          a {
            display: inline-block;
            background-color: #f4f4f4; 
            color: #007BFF; 
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            border: 2px solid #007BFF;
          } 
          
        </style>
      </head>
      <body>
      <div class="container">
      <h3>Suppression de Votre Compte</h3>
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Nous vous confirmons la suppression de votre compte ainsi que de toutes les données associées de nos systèmes. Veuillez noter que cette action est <strong>irréversible</strong>.</p>
      <p>Nous tenons à vous exprimer notre gratitude pour le temps passé ensemble et pour la confiance que vous avez placée en nos services. Nous espérons avoir contribué positivement à votre parcours, que ce soit dans la recherche d'opportunités professionnelles ou de talents.</p>
      <p>Si vous avez la moindre question ou si vous nécessitez de l'aide à l'avenir, notre équipe demeure à votre entière disposition. Pour toute assistance ou renseignement supplémentaire, n'hésitez pas à nous contacter en cliquant sur le bouton ci-dessous.</p>
      <a href="http://localhost:4200/contact">Nous Contacter</a>
      <p>Avec toute notre considération,</p>
      <p><strong>L'équipe de M&M Consulting</strong></p>
    </div>
  </body>

    </html>
  `;
    // On utilisera this.transporter pour envoyer l'email
    await this.sendGrid.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'Suppression de Votre Compte',
      html: emailBody,
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send Mail Awaiting Account Confirmation @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendSignupAwaitingMailConfirmation(
    email: string,
    confirmationMailToken: string,
    name: string,
  ): Promise<void> {
    // L'URL de confirmation en utilisant le token
    const confirmationUrl = `http://localhost:3000/api/users/confirm-email?token=${confirmationMailToken}`;
    // Corps de l'email en HTML
    const emailBody = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmation de Compte</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background: #fff;
              border: 1px solid #ddd;
              border-radius: 5px;
              text-align: center;
            }
            a {
              display: inline-block;
              background-color: #f4f4f4; 
              color: #007BFF; 
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              border: 2px solid #007BFF;
            } 
          </style>
        </head>
        <body>
          <div class="container">
            <h3>Confirmez votre adresse e-mail</h3>
            <p>Bonjour ${name},</p>
            <p>Merci de vous être inscrit sur notre plateforme. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
            <a  href="${confirmationUrl}">Confirmer mon compte</a>
            <p>Si vous n'avez pas demandé à créer un compte, veuillez ignorer cet e-mail.</p>
            <p>Cordialement,</p>
            <p>L'équipe de M&M Consulting</p>
          </div>
        </body>
      </html>
    `;
    // Envoi de l'e-mail
    // On utilisera this.transporter pour envoyer l'email
    await this.sendGrid.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'Confirmation de Compte',
      html: emailBody,
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send Signup Awaiting Confirmation @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendSignupAwaitingConfirmation(
    email: string,
    name: string,
  ): Promise<void> {
    const emailBody = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Inscription en Attente de Confirmation</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background: #fff;
              border: 1px solid #ddd;
              border-radius: 5px;
              text-align: center;
            }
            h3 {
              color: #444;
            }
            p {
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h3>Inscription en Attente de Confirmation</h3>
            <p>Bonjour ${name},</p>
            <p>Votre inscription sur la plateforme M&M Consulting est en cours de traitement. Nous sommes en train de vérifier vos informations.</p>
            <p>Une fois votre compte vérifié, vous recevrez un email de confirmation.</p>
            <p>Merci de votre patience et de votre confiance envers M&M Consulting.</p>
            <p>Cordialement,</p>
            <p>L'équipe M&M Consulting</p>
          </div>
        </body>
      </html>
    `;
    // On utilisera this.transporter pour envoyer l'email
    await this.sendGrid.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'Votre inscription est en attente de confirmation',
      html: emailBody,
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send reset password Confirmation @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendResetPassword(
    userEmail: string,
    url: string,
    code: string,
    name: string,
  ): Promise<void> {
    const emailBody = `
            <!DOCTYPE html>
            <html lang="fr">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Réinitialisation de Mot de Passe</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    line-height: 1.6;
                  }
                  .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    text-align: center;
                  }
                  a {
                    display: inline-block;
                    background-color: #f4f4f4; 
                    color: #007BFF; 
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    border: 2px solid #007BFF;
                  }
                  a:hover {
                    background-color: #0056b3;
                  }
                  p {
                    color: #444;
                  }
                  .code {
                    font-size: 1.2em;
                    font-weight: bold;
                    color: #d9534f;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h3>Réinitialisation de votre mot de passe</h3>
                  <p>Bonjour ${name},</p>
                  <p>Vous avez demandé à réinitialiser votre mot de passe sur le site M&M Consulting.</p>
                  <p>Pour réinitialiser votre mot de passe, veuillez cliquer sur le lien ci-dessous :</p>
                  <a href="${url}">Réinitialiser mon mot de passe</a>
                  <p>Voici votre code de sécurité :</p>
                  <p class="code">${code}</p>
                  <p>Ce code expirera dans 15 minutes.</p>
                  <p>Si vous n'avez pas demandé à réinitialiser votre mot de passe, veuillez ignorer cet email.</p>
                  <p>Cordialement,</p>
                  <p>L'équipe M&M Consulting</p>
                </div>
              </body>
            </html>
          `;
    await this.sendGrid.send({
      to: userEmail,
      from: process.env.FROM_EMAIL,
      subject: 'Réinitialisation de mot de passe',
      html: emailBody,
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send reset password change Confirmation @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendPasswordChangeConfirmation(
    userEmail: string,
    name: string,
  ): Promise<void> {
    const emailBody = `
            <!DOCTYPE html>
            <html lang="fr">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Confirmation de Modification de Mot de Passe</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    line-height: 1.6;
                  }
                  .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    text-align: center;
                  }
                  h3 {
                    color: #444;
                  }
                  p {
                    margin: 15px 0;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h3>Modification de Votre Mot de Passe</h3>
                  <p>Bonjour ${name},</p>
                  <p>Nous vous confirmons que votre mot de passe a été modifié avec succès.</p>
                  <p>Si vous n'avez pas demandé cette modification, veuillez contacter immédiatement notre support.</p>
                  <p>Cordialement,</p>
                  <p>L'équipe M&M Consulting</p>
                </div>
              </body>
            </html>
          `;
    await this.sendGrid.send({
      to: userEmail,
      from: process.env.FROM_EMAIL,
      subject: 'Confirmation de Modification de Mot de Passe',
      html: emailBody,
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send Signup Not Confirmed@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendSignupNotConfirmation(
    userEmail: string,
    noteInscription: string,
    name: string,
  ) {
    const emailBody = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Inscription Non Confirmée</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background: #fff;
              border: 1px solid #ddd;
              border-radius: 5px;
              text-align: center;
            }
            h3 {
              color: #444;
            }
            p {
              margin: 15px 0;
            }
            .link {
              display: inline-block;
            background-color: #f4f4f4; 
            color: #007BFF; 
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            border: 2px solid #007BFF;
            } 
          </style>
        </head>
        <body>
          <div class="container">
            <h3>Inscription Non Confirmée</h3>
            <p>Bonjour ${name},</p>
            <p>Nous regrettons de vous informer que votre inscription chez M&M Consulting n'a pas pu être confirmée en raison du motif suivant : <br> <strong>${noteInscription}</strong>.</p>
            <p>Nous vous invitons à reprendre votre inscription en tenant compte des consignes fournies.</p>
            <a class="link" href="http://localhost:4200/role">Reprendre l'Inscription</a>
            <p>Si vous pensez qu'il s'agit d'une erreur, ou pour plus d'informations, veuillez nous contacter à :</p>
            <a href="mailto:consultingmm2@gmail.com">Contactez-nous</a>
            <p>Nous vous remercions de votre intérêt pour M&M Consulting et espérons pouvoir vous accompagner dans un futur proche.</p>
            <p>Cordialement,</p>
            <p>L'équipe M&M Consulting</p>
          </div>
        </body>
      </html>
    `;
    await this.sendGrid.send({
      to: userEmail,
      from: process.env.FROM_EMAIL,
      subject: 'Inscription Non Confirmée',
      html: emailBody,
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send Signup Confirmation @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendSignupConfirmation(userEmail: string, name: string) {
    const emailBody = `
              <!DOCTYPE html>
              <html lang="fr">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Confirmation d'Inscription</title>
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        color: #333;
                        line-height: 1.6;
                      }
                      .container {
                        max-width: 600px;
                        margin: 20px auto;
                        padding: 20px;
                        background: #fff;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        text-align: center;
                      }
                      a {
                        display: inline-block;
                        background-color: #f4f4f4; 
                        color: #007BFF; 
                        padding: 10px 20px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        border: 2px solid #007BFF;
                      }
                      p {
                        margin: 15px 0;
                      }
                      h3 {
                        color: #444;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <h3>Confirmation de votre inscription</h3>
                      <p>Bonjour ${name},</p>
                      <p>Nous sommes heureux de vous confirmer votre inscription chez M&M Consulting.</p>
                      <p>Pour acceder à votre compte, veuillez cliquer sur le lien ci-dessous:</p>
                      <a href="http://localhost:4200/signin">Connectez-vous</a>
                      <p>Merci de nous avoir choisi pour votre développement professionnel.</p>
                      <p>Cordialement,</p>
                      <p>L'équipe M&M Consulting</p>
                    </div>
                  </body>
                </html>`;
    await this.sendGrid.send({
      to: userEmail,
      from: process.env.FROM_EMAIL,
      subject: "Confirmation d'Inscription",
      html: emailBody,
    });
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$ E-MAILS FOR  MODULE JOB LISTINGS  $$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send listing waiting Confirmation @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendJoblistingAwaitingConfirmation(
    email: string,
    name: string,
    jobTitle: string,
  ) {
    const emailBody = `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>En Attente de Confirmation de Publication d'Emploi</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333;
                line-height: 1.6;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 5px;
                text-align: center;
              }
              h3 {
                color: #444;
              }
              p {
                margin: 15px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h3>Confirmation en Attente pour Votre Publication d'Emploi</h3>
              <p>Bonjour ${name},</p>
              <p>Nous avons bien reçu votre offre d'emploi pour le poste de <strong>${jobTitle}</strong>. Votre annonce est actuellement en cours de vérification par notre équipe.</p>
              <p>Une fois la vérification terminée et si l'annonce est conforme à nos critères, elle sera publiée sur notre plateforme.</p>
              <p>Nous vous remercions de votre confiance et de votre patience.</p>
              <p>Cordialement,</p>
              <p>L'équipe M&M Consulting</p>
            </div>
          </body>
        </html>
    `;
    await this.sendGrid.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Votre Publication d'Emploi ${jobTitle} est en Attente de Confirmation`,
      html: emailBody,
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send Job Listing Confirmation @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendJobListingConfirmation(
    email: string,
    name: string,
    jobTitle: string,
  ) {
    const emailBody = `  
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmation de Votre Annonce d'Emploi</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background: #fff;
              border: 1px solid #ddd;
              border-radius: 5px;
              text-align: center;
            }
            h3 {
              color: #444;
            }
            p {
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h3>Confirmation de Votre Annonce d'Emploi</h3>
            <p>Bonjour ${name},</p>
            <p>Nous sommes heureux de vous informer que votre annonce d'emploi pour le poste de
            <strong>${jobTitle}</strong> a été validée et est maintenant publiée sur notre plateforme.</p>
            <p>Vous pouvez suivre les candidatures et gérer votre annonce depuis votre tableau de bord.</p>
            <p>Merci de votre confiance envers TRT Conseil.</p>
            <p>Cordialement,</p>
            <p>L'équipe de TRT Conseil</p>
          </div>
        </body>
      </html>
    `;
    await this.sendGrid.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: `Confirmation de la publication de votre annonce d'emploi pour le poste de ${jobTitle}`,
      html: emailBody,
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send Job Listing Not Confirmed with demand to update @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendJobListingNotConfirmedWithDemandToUpdate(
    name: string,
    email: string,
    jobTitle: string,
    noteJoblisting: string,
    date: string,
  ) {
    const emailBody = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Annonce d'Emploi Non Validée</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #000;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background: #fff;
              border: 1px solid #ddd;
              border-radius: 5px;
              text-align: center;
            }
            .demande {
              color: red; 
              font-weight: bold; 
              font-style: italic; 
            }          
            h3 {
              color: #444;
            }
            p {
              margin: 15px 0;
            }

          </style>
        </head>
        <body>
        <div class="container">
        <h3>Annonce d'Emploi Non Validée - Demande de Modification</h3>
        <p>Bonjour ${name},</p>
        <p>Nous avons examiné votre annonce d'emploi pour le poste de <strong>${jobTitle}</strong> et avons identifié certains éléments nécessitant des modifications. Voici les remarques à prendre en compte :</p>
        <p><em><strong class="demande">${noteJoblisting}</strong></em></p>
        <p>Vous disposez jusqu'au <strong class="demande">${date}</strong> pour apporter les modifications nécessaires. Passé ce délai, sans modification de votre part, votre annonce sera malheureusement automatiquement supprimée de notre plateforme.</p>
        <p>Nous vous invitons à vous connecter à votre espace utilisateur pour effectuer ces changements dès que possible. Pour toute question ou besoin d'assistance, notre équipe de support reste à votre disposition.</p>
        <p>Merci pour votre compréhension et votre réactivité.</p>
        <p>Cordialement,</p>
        <p>L'équipe M&M Consulting</p>
      </div>
        </body>
      </html>
    `;
    await this.sendGrid.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: `Votre annonce d'emploi pour le poste de ${jobTitle} n'a pas été validée`,
      html: emailBody,
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send Job Listing Not Confirmed and deleted immediatily @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ jobTitle: string
  async sendJobListingNotConfirmed(
    name: string,
    email: string,
    jobTitle: string,
  ) {
    const emailBody = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Annonce d'Emploi Non Validée</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background: #fff;
              border: 1px solid #ddd;
              border-radius: 5px;
              text-align: center;
            }
            h3 {
              color: #444;
            }
            p {
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
        <div class="container">
          <h3>Annonce d'Emploi Non Validée</h3>
          <p>Bonjour ${name},</p>
          <p>Après un examen attentif, nous sommes au regret de vous informer que votre annonce d'emploi pour le poste de <strong>${jobTitle}</strong> n'a pas été validée pour publication sur notre plateforme M&M Consulting.</p>
          <p>Cette décision est principalement due au fait que l'annonce ne respecte pas intégralement nos normes de qualité, notamment en ce qui concerne la clarté des exigences du poste, la conformité avec nos politiques internes, et le respect des valeurs éthiques que nous soutenons.</p>
          <p>Nous comprenons que cette nouvelle peut être décevante, mais notre objectif est d'assurer la meilleure expérience possible pour tous nos utilisateurs. Pour toute question ou pour obtenir de l'aide, n'hésitez pas à contacter notre service clientèle à <a href="mailto:info@mm.consulting.be">info@mm.consulting.be</a>.</p>
          <p>Nous vous remercions de votre compréhension et espérons que vous continuerez à utiliser M&M Consulting pour vos futurs besoins en recrutement.</p>
          <p>Cordialement,</p>
          <p>L'équipe M&M Consulting</p>
        </div>
      </body>
      </html>
    `;

    await this.sendGrid.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: `Votre annonce d'emploi pour le poste de ${jobTitle} n'a pas été validée`,
      html: emailBody,
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send Job Opportunity Email @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendJobOpportunityEmail(
    email: string,
    name: string,
    jobTitle: string,
    jobListingId: number,
  ) {
    const jobDetailsUrl = `http://localhost:4200/joblistings/detail/${jobListingId}`;
    const emailBody = `
        <!DOCTYPE html>
        <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Opportunité d'Emploi</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        color: #333;
                        line-height: 1.6;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        padding: 20px;
                        background: #fff;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                    }
                    h3 {
                        color: #444;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h3>Nouvelle Opportunité d'Emploi : ${jobTitle}</h3>
                    <p>Bonjour ${name},</p>
                    <p>Une nouvelle opportunité d'emploi correspondant à votre profil a été publiée : <strong>${jobTitle}</strong>.</p>
                    <p>Pour en savoir plus sur cette offre et postuler, veuillez cliquer sur le lien ci-dessous:</p>
                    <a href="${jobDetailsUrl}">Voir l'offre d'emploi</a>
                    <p>Nous vous souhaitons bonne chance dans votre candidature.</p>
                    <p>Cordialement,</p>
                    <p>L'équipe M&M Consulting</p>
                </div>
            </body>
        </html>`;
    await this.sendGrid.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: `Nouvelle Opportunité d'Emploi : ${jobTitle}`,
      html: emailBody,
    });
  }
  async sendMailToExtendApplicationDeadline(
    email: string,
    jobTitle: string,
    name: string,
    deadline: string,
    jobListingId: number,
    deadlineToDelete: string,
  ) {
    const jobListingDetailUrl = `http://localhost:3000/joblisting/detail?=${jobListingId}`; // URL corrigée
    const emailBody = `
              <!DOCTYPE html>
              <html lang="fr">
                  <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Confirmation d'Inscription</title>
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        color: #333;
                        line-height: 1.6;
                      }
                      .container {
                        max-width: 600px;
                        margin: 20px auto;
                        padding: 20px;
                        background: #fff;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        text-align: center;
                      }
                      a {
                        display: inline-block;
                        background-color: #f4f4f4; 
                        color: #007BFF; 
                        padding: 10px 20px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        border: 2px solid #007BFF;
                      }
                      p {
                        margin: 15px 0;
                      }
                      h3 {
                        color: #444;
                      }
                    </style>
                  </head>
                  <body>
                  <div class="container">
                  <h3>Notification de Fin Imminente de Votre Publication d'Emploi</h3>
          <p>Bonjour ${name},</p>
          <p>Nous tenons à vous informer que votre offre d'emploi intitulée <strong>${jobTitle}</strong>,
          publiée sur notre plateforme et dont la date limite de candidature est fixée au <strong>${deadline}</strong>, 
          sera automatiquement supprimée dans 15 jours, c'est-à-dire le  <strong>${deadlineToDelete}</strong>.</p>
          <p>Si vous estimez que le poste n'a pas encore été pourvu et souhaitez prolonger la visibilité de votre annonce,
          nous vous invitons à <a href="${jobListingDetailUrl}">mettre à jour la date de fin de publication</a> dès que possible.</p>
          <p>Cette démarche vous permettra de continuer à recevoir des candidatures et d'augmenter vos chances de trouver le candidat idéal.</p>
          <p>Pour toute assistance ou question, notre équipe reste à votre disposition.</p>
          <p>Nous vous remercions pour votre confiance en notre service.</p>
          <p>Cordialement,</p>
          <p>L'équipe M&M Consulting</p>
              </div>
                  </body>
                </html>`;
    await this.sendGrid.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: 'Notification de Date limite de Postulation',
      html: emailBody,
    });
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$ E-MAILS FOR  MODULE JOB APPLICATION  $$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send Job Application created and awainting Confirmation @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendJobApplicationAwaitingConfirmation(
    email: string,
    name: string,
    jobTitle: string,
  ) {
    const emailBody = `
        <!DOCTYPE html>
        <html lang="fr">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmation de Postulation d'Emploi</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333;
                line-height: 1.6;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 5px;
                text-align: center;
              }
              h3 {
                color: #444;
              }
              p {
                margin: 15px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h3>Confirmation de Votre Postulation d'Emploi</h3>
              <p>Bonjour ${name},</p>
              <p>Nous avons bien reçu votre candidature pour le poste de <strong>${jobTitle}</strong>. Nous vous remercions pour votre intérêt.</p>
              <p>Nous allons examiner votre dossier et nous vous contacterons si votre profil correspond à nos besoins pour ce poste.</p>
              <p>Merci de votre confiance envers M&M Consulting.</p>
              <p>Cordialement,</p>
              <p>L'équipe de recrutement M&M Consulting</p>
            </div>
          </body>
        </html>
    `;
    await this.sendGrid.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: `Confirmation de Votre Postulation pour le poste de  ${jobTitle}.`,
      html: emailBody,
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send Candidat CV to Recruiter with Interview info @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  async sendCvToRecruiter(
    recruiterName: string,
    recruiterEmail: string,
    jobTitle: string,
    candidateFirstnameName: string,
    interviewNote: string,
    userId: number,
  ) {
    // Récupérer les détails de l'utilisateur depuis la base de données
    const user = await this.getUserDetails(userId);

    if (!user || !user.cv) {
      throw new NotFoundException(`Cet utilisateur n'a pas de CV.`);
    }

    const cvFilePath = path.join(process.cwd(), 'uploads', user.cv);
    const cvContent = fs.readFileSync(cvFilePath);
    const cvContentBase64 = cvContent.toString('base64');

    // Parse interviewNote
    const parsedInterviewNote = JSON.parse(interviewNote);

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const cvUrl = `${baseUrl}/uploads/${user.cv}`;

    const emailBody = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CV du Candidat</title>
<style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        color: #333;
        line-height: 1.6;
        margin: 0;
        padding: 0;
    }
    .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 5px;
    }
    h3 {
        color: #333;
        text-align: center;
    }
    p, .note {
        text-align: justify;
    }
    .note {
        margin: 10px 0;
    }
    .header, .footer {
        text-align: center;
        margin: 20px 0;
    }
    .details {
        margin: 20px 0;
    }
    .signature {
        margin-top: 30px;
        font-style: italic;
    }
</style>
</head>
<body>
<div class="container">
    <h3>CV du Candidat pour le Poste ${jobTitle}</h3>
    <p class="header">Bonjour ${recruiterName},</p>
    <p>Suite à notre entretien préliminaire, nous avons le plaisir de vous transmettre le CV de <strong>${candidateFirstnameName}</strong> 
    pour le poste de <strong>${jobTitle}</strong>. Sa solide expérience et son dynamisme font de lui un excellent candidat pour votre équipe.</p>
    <p>Voici quelques remarques importantes de notre entretien :</p>
    <div class="note">
        <b>Note de l'entretien :</b><br><br>
        <b>Candidat :</b> ${parsedInterviewNote.candidate}<br>
        <b>Date de l'entretien :</b> ${parsedInterviewNote.interviewDate}<br>
        <b>Poste :</b> ${parsedInterviewNote.position}<br><br>
        <b>Compétences techniques :</b><br> ${parsedInterviewNote.technicalSkills.replace(/\n/g, '<br>')}<br><br>
        <b>Expérience professionnelle :</b><br> ${parsedInterviewNote.professionalExperience.replace(/\n/g, '<br>')}<br><br>
        <b>Qualités personnelles :</b><br> ${parsedInterviewNote.personalQualities.replace(/\n/g, '<br>')}<br><br>
        <b>Recommandation :</b><br> ${parsedInterviewNote.recommendation.replace(/\n/g, '<br>')}<br><br>
        <b>Signature :</b><br> ${parsedInterviewNote.signature.replace(/\n/g, '<br>')}
    </div>
    <p>Le profil du candidat est désormais ouvert et accessible depuis votre tableau de bord.
     Vous pouvez consulter le CV du candidat en cliquant sur ce <a href="${cvUrl}">lien</a> 
     et voir des informations supplémentaires sur son profil.</p>
    <p>Nous restons à votre disposition pour toute information supplémentaire.</p>
    <p class="footer">Cordialement,</p>
    <p class="footer">L'équipe de recrutement M&M Consulting</p>
</div>
</body>
</html>
`;

    await this.sendGrid.send({
      from: process.env.FROM_EMAIL,
      to: recruiterEmail,
      subject: `CV du Candidat pour le Poste ${jobTitle}`,
      html: emailBody,
      attachments: [
        {
          content: cvContentBase64,
          filename: path.basename(cvFilePath),
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Méthode pour envoyer l'email avec fichier Excel @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  async sendAccountingEmailWithArchivedJobInfo(historique: Historiques) {
    // Création du fichier Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Archived Job Information');

    worksheet.columns = [
      //  { header: 'Nunero enregistrement', key: 'histNumber', width: 30 },
      { header: 'Date de publication', key: 'publicationDate', width: 20 },
      // { header: 'Date de fermeture', key: 'jobCloseDate', width: 20 },
      { header: "Nom de l'entreprise", key: 'nameCompany', width: 30 },
      { header: 'Nom du recruteur', key: 'nameRecruiter', width: 30 },
      //   { header: 'Prénom du recruteur', key: 'firstnameRecruiter', width: 30 },
      { header: 'Intitulé du poste', key: 'jobtitle', width: 30 },
      { header: 'Type de contrat', key: 'contractTypetitle', width: 20 },
      { header: 'Lieu du poste', key: 'JobLocation', width: 30 },
      { header: 'Nombre de candidats', key: 'numberOfCandidates', width: 20 },
      { header: 'Consultant en charge', key: 'checkUserConsultant', width: 30 },
      //   { header: 'Numéro TVA', key: 'tvaNumber', width: 20 },
      //  { header: 'Adresse de l\'entreprise', key: 'addressCompany', width: 30 },
      //   { header: 'Email', key: 'email', width: 30 },
      //   { header: 'Numéro de téléphone', key: 'phoneNumber', width: 20 },
      { header: 'Date de création', key: 'createdAt', width: 20 },
      { header: 'Date de mise à jour', key: 'updatedAt', width: 20 },
    ];

    worksheet.addRow({
      // histNumber : historique.histNumber,
      publicationDate: historique.publicationDate,
      // jobCloseDate: historique.jobCloseDate,
      nameCompany: historique.nameCompany,
      nameRecruiter: historique.nameRecruiter,
      //   firstnameRecruiter: historique.firstnameRecruiter,
      jobtitle: historique.jobtitle,
      contractTypetitle: historique.contractTypetitle,
      JobLocation: historique.JobLocation,
      numberOfCandidates: historique.numberOfCandidates,
      checkUserConsultant: historique.checkUserConsultant,
      //   tvaNumber: historique.tvaNumber,
      //     addressCompany: historique.addressCompany,
      //    email: historique.email,
      //    phoneNumber: historique.phoneNumber,
      createdAt: historique.createdAt,
      updatedAt: historique.updatedAt,
    });

    const filePath = path.join(__dirname, 'ArchivedJobInfo.xlsx');
    await workbook.xlsx.writeFile(filePath);

    // Lecture du contenu du fichier Excel en base64
    const fileContent = fs.readFileSync(filePath);
    const fileContentBase64 = fileContent.toString('base64');

    // Contenu de l'email
    const emailBody = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Informations sur l'offre archivée</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
              line-height: 1.6;
              margin: 0;
              padding: 0;
          }
          .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background: #fff;
              border: 1px solid #ddd;
              border-radius: 5px;
          }
          h3 {
              color: #333;
              text-align: center;
          }
          p, .note {
              text-align: justify;
          }
          .note {
              margin: 10px 0;
          }
          .header, .footer {
              text-align: center;
              margin: 20px 0;
          }
          .details {
              margin: 20px 0;
          }
          .signature {
              margin-top: 30px;
              font-style: italic;
          }
      </style>
      </head>
      <body>
      <div class="container">
          <h3>Informations sur l'offre archivée</h3>
          <p class="header">Bonjour,</p>
          <p>Veuillez trouver ci-joint les informations concernant l'offre archivée :</p>
          <div class="note">
              <b>Date de publication :</b> ${historique.publicationDate}<br>
              <b>Nom de l'entreprise :</b> ${historique.nameCompany}<br>
              <b>Nom du recruteur :</b> ${historique.nameRecruiter}<br>
              <b>Intitulé du poste :</b> ${historique.jobtitle}<br>
              <b>Type de contrat :</b> ${historique.contractTypetitle}<br>
              <b>Lieu du poste :</b> ${historique.JobLocation}<br>
              <b>Nombre de candidats :</b> ${historique.numberOfCandidates}<br>
              <b>Consultant en charge :</b> ${historique.checkUserConsultant}<br>
          </div>
          <p>Nous restons à votre disposition pour toute information supplémentaire.</p>
          <p class="footer">Cordialement,</p>
          <p class="footer">L'équipe de recrutement M&M Consulting</p>
      </div>
      </body>
      </html>
    `;

    /* <div class="note">
                 <b>Nunero enregistrement :</b> ${historique.histNumber}<br>
              <b>Date de publication :</b> ${historique.publicationDate}<br>
              <b>Date de fermeture :</b> ${historique.jobCloseDate}<br>
              <b>Nom de l'entreprise :</b> ${historique.nameCompany}<br>
              <b>Nom du recruteur :</b> ${historique.nameRecruiter}<br>
              <b>Prénom du recruteur :</b> ${historique.firstnameRecruiter}<br>
              <b>Intitulé du poste :</b> ${historique.jobtitle}<br>
              <b>Type de contrat :</b> ${historique.contractTypetitle}<br>
              <b>Lieu du poste :</b> ${historique.JobLocation}<br>
              <b>Nombre de candidats :</b> ${historique.numberOfCandidates}<br>
              <b>Consultant en charge :</b> ${historique.checkUserConsultant}<br>
              <b>Numéro TVA :</b> ${historique.tvaNumber}<br>
              <b>Adresse de l'entreprise :</b> ${historique.addressCompany}<br>
              <b>Email :</b> ${historique.email}<br>
              <b>Numéro de téléphone :</b> ${historique.phoneNumber}<br>
          </div>*/

    // Envoi de l'email
    await this.sendGrid.send({
      from: process.env.FROM_EMAIL,
      to: 'ndrianass00@gmail.com', // Adresse email du service de comptabilité
      subject: `Informations sur l'offre archivée pour facturation - ${historique.nameCompany}`,
      html: emailBody,
      attachments: [
        {
          content: fileContentBase64,
          filename: 'ArchivedJobInfo.xlsx',
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          disposition: 'attachment',
        },
      ],
    });

    // Suppression du fichier Excel après envoi
    fs.unlinkSync(filePath);
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send Job Application Accepted @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendJobApplicationAccepted(
    name: string,
    email: string,
    jobTitle: string,
  ) {
    const emailBody = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Candidature Acceptée</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background: #fff;
              border: 1px solid #ddd;
              border-radius: 5px;
              text-align: center;
            }
            h3 {
              color: #444;
            }
            p {
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h3>Félicitations - Candidature Acceptée</h3>
            <p>Bonjour ${name},</p>
            <p>Nous sommes heureux de vous informer que votre candidature pour le poste de <strong>${jobTitle}</strong> a été acceptée pour un premier entretien. Votre profil correspond à nos attentes pour ce poste.</p>
            <p>Un membre de notre équipe de recrutement vous contactera dans les plus brefs délais pour organiser un entretien et discuter des prochaines étapes.</p>
            <p>Nous vous remercions pour votre intérêt pour notre entreprise et sommes impatients de vous rencontrer.</p>
            <p>Cordialement,</p>
            <p>L'équipe de recrutement M&M Consulting</p>
          </div>
        </body>
      </html>
    `;

    await this.sendGrid.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Candidature Acceptée pour le Poste de ${jobTitle}`,
      html: emailBody,
    });
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send Job  Application Not Accepted @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendJobApplicationNotAccepted(
    name: string,
    firstname: string,
    email: string,
    jobTitle: string,
  ) {
    const emailBody = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Candidature Non Retenue</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background: #fff;
              border: 1px solid #ddd;
              border-radius: 5px;
              text-align: center;
            }
            h3 {
              color: #444;
            }
            p {
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h3>Candidature Non Retenue pour le Poste de ${jobTitle}</h3>
            <p>Bonjour ${firstname} ${name},</p>
            <p>Nous avons le regret de vous informer que votre candidature pour le poste de <strong>${jobTitle}</strong> n'a pas été retenue.</p>
            <p>Nous avons reçu de nombreuses candidatures de candidats qualifiés et la sélection a été très difficile.</p>
            <p>Nous vous remercions de l'intérêt que vous avez porté à notre entreprise et vous souhaitons le meilleur dans votre recherche d'emploi.</p>
            <p>Cordialement,</p>
            <p>L'équipe de recrutement M&M Consulting</p>
          </div>
        </body>
      </html>
    `;

    await this.sendGrid.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Candidature Non Retenue pour le Poste de ${jobTitle}`,
      html: emailBody,
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send email for Interviews not accepted @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendJobApplicationInterviewAccepted(
    name: string,
    email: string,
    jobTitle: string,
    companyName: string,
  ) {
    const emailBody = `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Entretien d'Embauche Concluant</title>
        <style>
        body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
              line-height: 1.6;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 30px auto;
              padding: 20px;
              background: #fff;
              border: 1px solid #ddd;
              border-radius: 5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              text-align: center;
            }
            h3 {
              color: #4caf50;
              margin-top: 0;
            }
            p {
              margin: 15px 0;
            }
            strong {
              color: #333;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 0.9em;
              color: #666;
            }

          </style>
        </head>
      <body>
      <div class="container">
      <h3>Étape Suivante de Votre Processus de Recrutement</h3>
      <p>Bonjour ${name},</p>
      <p>Nous sommes ravis de vous annoncer que votre entretien initial pour le poste de <strong>${jobTitle}</strong> a été concluant. Votre profil a retenu notre attention et nous sommes convaincus de vos compétences et de votre potentiel.</p>
      <p>Afin de finaliser le processus de recrutement, nous transmettons votre candidature à notre partenaire, l'entreprise <strong>${companyName}</strong>  où le poste est à pourvoir. Ils prendront contact avec vous dans les plus brefs délais pour convenir d'un dernier entretien directement avec eux.</p>
      <p>Nous vous remercions de votre intérêt pour notre entreprise et vous souhaitons bonne chance pour la dernière étape du processus de recrutement.</p>
      <div class="footer">
        <p>Cordialement,</p>
        <p>L'équipe de recrutement M&M Consulting</p>
      </div>
        </div>
      </body>
    </html>
  `;
    await this.sendGrid.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Entretien d'Embauche Concluant pour le Poste de ${jobTitle}`,
      html: emailBody,
    });
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Send email for Interviews accepted @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async sendJobApplicationInterviewNotAccepted(
    name: string,
    email: string,
    jobTitle: string,
  ) {
    const emailBody = `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Entretien d'Embauche - Suite</title>
        <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          color: #333;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 5px;
          text-align: center;
        }
        h3 {
          color: #444;
        }
        p {
          margin: 15px 0;
        }
        </style>
      </head>
      <body>
        <div class="container">
          <h3>Entretien d'Embauche - Suite</h3>
          <p>Bonjour ${name},</p>
          <p>Nous vous remercions d'avoir participé à l'entretien pour le poste de <strong>${jobTitle}</strong>. Après une évaluation approfondie, nous avons décidé de ne pas poursuivre votre candidature pour ce poste.</p>
          <p>Nous apprécions l'intérêt et le temps que vous avez consacré à cette opportunité et vous souhaitons le meilleur dans votre recherche d'emploi.</p>
          <p>Cordialement,</p>
          <p>L'équipe de recrutement M&M Consulting</p>
        </div>
      </body>
    </html>
  `;

    await this.sendGrid.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: `Entretien d'Embauche pour le Poste de ${jobTitle}`,
      html: emailBody,
    });
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$ E-MAILS FOR  MODULE JOB APPOINTMENT  $$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  async sendAppointmentConfirmationToCandidate(
    candidateName: string,
    candidateEmail: string,
    note: string,
    appointmentDate: string,
    timeSlot: string,
    consultantName: string,
  ) {
    const emailBody = `<!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de Rendez-Vous</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 5px;
            text-align: center;
          }
          h3 {
            color: #444;
          }
          p {
            margin: 15px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h3>Confirmation de Votre Rendez-Vous pour le poste de <strong>${note}</strong>.</p></h3>
          <p>Bonjour ${candidateName}, 
          <p>Suite à notre appel téléphonique, nous vous confirmons votre rendez-vous pour le <strong>${appointmentDate}</strong> à 
          <strong>${timeSlot}</strong> avec M. ${consultantName}.</p>
          <p>Veuillez noter que la durée de ce rendez-vous est d'une heure. Les détails de ce rendez-vous sont 
          disponibles sur votre profil sur notre plateforme.</p>
          <p>Pour tout changement ou nécessité d'ajustement de ce rendez-vous, nous vous prions de nous contacter directement.</p>
          <p>Nous vous remercions pour votre intérêt et sommes impatients de vous rencontrer.</p>
          <p>Cordialement,</p>
          <p>L'équipe de M&M Consulting</p>
        </div>
      </body>
    </html>
    `;
    await this.sendGrid.send({
      from: process.env.FROM_EMAIL,
      to: candidateEmail,
      subject: `Confirmation de Votre Rendez-Vous pour le poste ${note}`,
      html: emailBody,
    });
  }

  private async getUserDetails(userId: number) {
    return await this.prismaService.users.findUnique({
      where: { userId: userId },
    });
  }
}
