import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { addDays, differenceInYears } from 'date-fns';
import * as fs from 'fs';
import { existsSync, readFileSync } from 'fs';
import { unlink } from 'fs/promises';
import { PDFDocument } from 'pdf-lib';
import * as speakeasy from 'speakeasy';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileEmplyee } from './dto/UpdateProfileAdminDto';
import { UpdateProfileCandidateDto } from './dto/UpdateProfileCandidate';
import { UpdateProfileRecruiterDto } from './dto/UpdateProfileRecruiterDto';
import { ResetPasswordConfirmationDto } from './dto/resetPasswordConfirmationDto';
import { ResetPasswordDemandDto } from './dto/resetPasswordDemandDto';
import { SigninDto } from './dto/signinDto';
import { SignupAdminConsultantDto } from './dto/signupAdminConsultantDto';
import { SignupCandidateDto } from './dto/signupCandidateDto';
import { SignupRecruiterDto } from './dto/signupRecruiterDto';
import { UpdateEmplyeeByAdminDto } from './dto/updateEmplyeeByAdminDto';
import { UpdateNotificationDto } from './dto/updateNotificationDto';
import { UpdateUserByConsultantDto } from './dto/updateUserByConsultantDto';
import { ValidateUsersDto } from './dto/validateUsersDto';

import * as path from 'path';
import { ExperienceService } from '../experience/experience.service';
import { ErrorMessages } from 'src/shared/error-management/errors-message';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailerService: MailerService,
    private readonly experienceService: ExperienceService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Create User Admin or Consultant @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async signupAdminConsultant(
    signupAdminConsultantDto: SignupAdminConsultantDto,
    requestingUserId?: number,
  ) {
    try {
      const {
        name,
        firstname,
        dateBirth,
        sex,
        phoneNumber,
        email,
        password,
        address,
        roleId,
      } = signupAdminConsultantDto;

      // On verifie l'existence de l'utilisateur demandeur
      const requestUser = await this.verifyUsersExistence(requestingUserId);

      // on verifie si l'utilisateur demandeur est un administrateur
      if (!requestUser || requestUser.role.title !== 'Administrator') {
        throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED_CREATE_ADMIN_CONSULTANT);
      }

      // On recupère le nom et le prenom de l'utilisateur excécutant
      const adminName = requestUser.name + ' ' + requestUser.firstname;

      // On verifie si l'utilisateur est déjà inscrit
      await this.ckeckEmailUniquess(email);

      // On verifie si l'email fourni est valide.
      await this.isValidEmail(email);

      // On verifie si le nombre maximum d'administrateurs est atteint
      await this.checkAdminCountLimit(roleId);
      // On verifie si le sexe est ecrit comme recommandé
      await this.verifyUserSex(sex);
      // On verifie l'âge de l'utilisateur
      if (!this.isAgeValid(dateBirth)) {
        throw new BadRequestException(ErrorMessages.USER_UNDERAGE);
      }
      // On vérifie si le numero est au format valide.
      await this.isValidphoneNumber(phoneNumber);

      // On verifie si le mot de passe fourni est valide.
      await this.isValidPassword(password);

      // Récupération du titre du rôle
      const role = await this.verifyRoleExistence(roleId);

      // On verifie si le rôle est "Administrator" ou "Consultant"
      if (
        role.title !== 'Administrator' &&
        role.title !== 'Consultant' &&
        role.title !== 'External'
      ) {
        throw new BadRequestException(ErrorMessages.INVALID_ROLE );
      }

      // Hasher le mot de passe
      const hash = await bcrypt.hash(password, 10);

      // On génère un jeton de confirmation
      const confirmationMailToken = uuidv4();

      // On enregistre l'utilisateur dans la base de données avec le chemin du CV (si fourni)
      const user = await this.prismaService.users.create({
        data: {
          name,
          firstname,
          dateBirth,
          sex,
          phoneNumber,
          email,
          password: hash,
          address,
          roleId,
          confirmationMailToken,
          confirmationMailTokenExpires: new Date(
            Date.now() + 24 * 60 * 60 * 1000,
          ), // 24 heures plus tard
          verifiedMail: false, // Initialement non vérifié
          checkUserConsultant: adminName,
        },
      });
      // Envoi de l'e-mail pour verifier le compte de l'utilisateur
      await this.mailerService.sendSignupAwaitingMailConfirmation(
        email,
        confirmationMailToken,
        user.name,
      );

      // On retourne une réponse de succès
      return {
        result: true,
        data: {
          userId: user.userId,
          name: user.name,
          firstname: user.firstname,
          email: user.email,
        },
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Create User Candidat @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async signupCandidate(
    signupCandidateDto: SignupCandidateDto,
    cvFile?: Express.Multer.File,
  ) {
    try {
      const {
        name,
        firstname,
        dateBirth,
        sex,
        phoneNumber,
        email,
        password,
        jobTitleId,
        experienceId,
        address,
      } = signupCandidateDto;

      // On verifie l'unicité de l'adresse email pour éviter les doublons
      await this.ckeckEmailUniquess(email);

      // On verifie que l'email fourni est bien formé.
      await this.isValidEmail(email);

      // On vérifie que le numéro de téléphone est dans un format valide.
      await this.isValidphoneNumber(phoneNumber);

      // On verifie l'existence de l'intitulé de poste dans la base de données
      await this.verifyJobTitleExistence(jobTitleId);

      // On verifie l'existence de l'intitulé de l'experience dans la base de données
      await this.experienceService.verifyExperienceExistence(experienceId);

      // On verifie la conformité du sexe avec les valeurs attendues
      await this.verifyUserSex(sex);

      // On s'assurer que l'utilisateur a au moins 18 ans
      if (!this.isAgeValid(dateBirth)) {
        throw new BadRequestException(ErrorMessages.USER_UNDERAGE);
      }

      // On  hashe le mot de passe avant stockage
      await this.isValidPassword(password);

      // On va attribuer le Candidat
      const candidateRole = await this.prismaService.roles.findUnique({
        where: {
          title: 'Candidate',
        },
      });
      // recupere le Id du role:
      const roleID = candidateRole.roleId;

      // Hasher le mot de passe
      const hash = await bcrypt.hash(password, 10);

      let cvPath: string | null = null;

      // Traitement du fichier CV si fourni
      if (cvFile) {
        // On verifie que le fichier est bien un PDF
        if (cvFile.mimetype !== 'application/pdf' || !this.isPDF(cvFile)) {
          // On supprime le fichier en cas de format non conforme
          await this.deleteFile(cvFile.path);
          throw new BadRequestException(ErrorMessages.INVALID_FILE_FORMAT );
        }
        // On verifie que la taille du fichier ne dépasse pas 5MB
        const maxFileSize = 5 * 1024 * 1024; // 5MB
        if (cvFile.size > maxFileSize) {
          await this.deleteFile(cvFile.path);
          // On supprime le fichier si trop volumineux
          throw new BadRequestException(ErrorMessages.FILE_TOO_LARGE );
        }

        // On utilise uniquement le nom du fichier pour le stockage dans la base de données
        cvPath = cvFile.filename;
      }
      // Génération d'un token de confirmation de mail
      const confirmationMailToken = uuidv4();

      // On définit la date d'expiration du token à 24 heures plus tard
      const confirmationMailTokenExpires = addDays(new Date(), 1); // 24 heures plus tard

      // On enregistre l'utilisateur dans la base de données avec toutes les données collectées
      const user = await this.prismaService.users.create({
        data: {
          name,
          firstname,
          dateBirth,
          sex,
          phoneNumber,
          email,
          experienceId,
          password: hash,
          jobTitleId,
          cv: cvPath,
          address,
          addNote: false,
          roleId: roleID,
          confirmationMailToken,
          confirmationMailTokenExpires: confirmationMailTokenExpires, // 24 heures plus tard
          verifiedMail: false, // Initialement non vérifié
        },
      });

      // Envoi de l'e-mail pour verifier le compte de l'utilisateur
      await this.mailerService.sendSignupAwaitingMailConfirmation(
        email,
        confirmationMailToken,
        user.name,
      );
      // On retourne une réponse de succès
      return {
        result: true,
        data: {
          userId: user.userId,
          name: user.name,
          firstname: user.firstname,
          email: user.email,
        },
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Gestion des erreurs : si un fichier CV a été téléchargé mais qu'une erreur se produit, il doit être supprimé
      if (cvFile) {
        // Supprimer le fichier CV téléchargé
        await this.deleteFile(cvFile.path);
      }
      // Relancer l'erreur pour une gestion plus globale ou spécifique selon le contexte
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Create User Recruiter @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async signupRecruiter(signupsignupRecruiterDto: SignupRecruiterDto) {
    try {
      const {
        name,
        firstname,
        dateBirth,
        sex,
        phoneNumber,
        email,
        password,
        tvaNumber,
        nameCompany,
        descriptionCompany,
        addressCompany,
      } = signupsignupRecruiterDto;

      // On verifie si l'utilisateur est déjà inscrit
      await this.ckeckEmailUniquess(email);

      // On verifie si l'email fourni est valide.
      await this.isValidEmail(email);

      // On verifie si le sexe est ecrit comme recommandé
      await this.verifyUserSex(sex);

      // On verifie l'âge de l'utilisateur
      if (!this.isAgeValid(dateBirth)) {
        throw new BadRequestException(ErrorMessages.USER_UNDERAGE);
      }
      // On verifie si le mot de passe fourni est valide.
      await this.isValidPassword(password);

      // On vérifie si le numero est au format valide.
      await this.isValidphoneNumber(phoneNumber);

      // On vérifie si le numero TVA est au format valide.
      await this.isValidTvaNumber(tvaNumber);

      if (nameCompany.length > 250 || addressCompany.length > 250) {
        throw new BadRequestException(ErrorMessages.COMPANY_NAME_LONG);
      }

      // On verifie la longueur de la description
      if (
        !descriptionCompany ||
        descriptionCompany.length < 10 ||
        descriptionCompany.length > 1500
      ) {
        throw new BadRequestException(ErrorMessages.INVALID_COMPANY_DESCRIPTION_LENGTH);
      }

      const roleRecruite = await this.prismaService.roles.findFirst({
        where: {
          title: 'Recruiter',
        },
      });
      const roleID = roleRecruite.roleId;

      // Hasher le mot de passe
      const hash = await bcrypt.hash(password, 10);
      // On génère un jeton de confirmation
      const confirmationMailToken = uuidv4();

      // On enregistre l'utilisateur dans la base de données
      const user = await this.prismaService.users.create({
        data: {
          name,
          firstname,
          dateBirth,
          sex,
          phoneNumber,
          email,
          password: hash,
          tvaNumber,
          nameCompany,
          addressCompany,
          descriptionCompany,
          roleId: roleID,
          confirmationMailToken,
          confirmationMailTokenExpires: new Date(
            Date.now() + 24 * 60 * 60 * 1000,
          ), // 24 heures plus tard
          verifiedMail: false, // Initialement non vérifié
        },
      });

      // Envoi de l'e-mail pour verifier le compte de l'utilisateur
      await this.mailerService.sendSignupAwaitingMailConfirmation(
        email,
        confirmationMailToken,
        user.name,
      );
      // On retourne une réponse de succès
      return {
        result: true,
        data: {
          userId: user.userId,
          name: user.name,
          firstname: user.firstname,
          email: user.email,
        },
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Login @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // Méthode pour connecter un utilisateur à l'application
  async signin(signinDto: SigninDto) {
    try {
      // Récupération de l'email et du mot de passe depuis le DTO (Data Transfer Object)
      const { email, password } = signinDto;

      // On vérifie si l'utilisateur existe dans la base de données
      const user = await this.verifyEmailExistence(email);

      // On vérifie si le compte de l'utilisateur est actif
      if (!user.actif)
      throw new ForbiddenException(ErrorMessages.USER_INACTIVE);

      // On compare le mot de passe fourni avec celui enregistré en base de données
      const match = await bcrypt.compare(password, user.password);
      if (!match) throw new BadRequestException(ErrorMessages.INVALID_LOGIN); 

      // On incrémente la version du token pour invalider les anciens tokens
      await this.prismaService.users.update({
        where: { userId: user.userId },
        data: { tokenVersion: { increment: 1 } },
      });

      // Création du payload pour les tokens JWT
      const payload = {
        userId: user.userId,
        name: user.name,
        firstname: user.firstname,
        email: user.email,
        role: user.role.title,
        tokenVersion: user.tokenVersion + 1,
      };

      // Création du token d'accès JWT avec une durée de validité de 2 heures
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '2h',
        secret: this.configService.get('SECRET_KEY'),
      });

      // Calcul du temps d'expiration pour le token d'accès (en secondes)
      const expireTime = Math.floor(Date.now() / 1000) + 2 * 60 * 60; // 2 heures en secondes

      // Création du refresh token JWT avec une durée de validité de 7 jours
      const refreshToken = this.jwtService.sign(payload, {
        expiresIn: '7d',
        secret: this.configService.get('REFRESH_SECRET_KEY'),
      });

      // Mise à jour de l'utilisateur avec le refresh token dans la base de données
      await this.prismaService.users.update({
        where: { userId: user.userId },
        data: { refreshToken },
      });

      // Retour de la réponse avec les tokens et les informations de l'utilisateur
      return {
        result: true, // Indique que l'opération de connexion a réussi.
        data: {
          token: {
            accessToken, // Le token JWT utilisé pour accéder aux ressources sécurisées.
            refreshToken, // Un token JWT utilisé pour obtenir un nouvel accessToken une fois ce dernier expiré.
            tokenType: 'Bearer', // Le type de token, généralement "Bearer"
            expireTime, // Temps d'expiration du token
          },
          user: {
            name: user.name, // Le nom d'utilisateur
            firstname: user.firstname, // Le prenom d'utilisateur
            email: user.email, // L'email de l'utilisateur
            role: user.role.title, // Le titre du rôle de l'utilisateur
          },
        },
        error_code: null, // Aucune erreur n'est survenue,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  refreshToken @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async refreshToken(refreshToken: string) {
    // Validation de base du refreshToken
    if (!refreshToken) {
      // 30 est arbitraire ici
     
      throw new UnauthorizedException(ErrorMessages.INVALID_REFRESH_TOKEN);
    }

    const user = await this.prismaService.users.findFirst({
      where: { refreshToken },
    });

    if (!user) throw new UnauthorizedException(ErrorMessages.INVALID_REFRESH_TOKEN);

    const payload = { sub: user.userId, email: user.email };
    const newAccessToken = this.jwtService.sign(payload, {
      expiresIn: '2h',
      secret: this.configService.get('SECRET_KEY'),
    });

    return { accessToken: newAccessToken };
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  logout @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async logout(userId: number) {
    try {
      // On verifie si l'utilisateur (requestingUserId) existe dans la base de données
      await this.verifyUsersExistence(userId);
      // On réinitialise le refreshToken de l'utilisateur à null
      await this.prismaService.users.update({
        where: { userId },
        data: {
          refreshToken: null,
          tokenVersion: { increment: 1 },
        }, // Réinitialiser le refreshToken à  null
        // garantit que les tokens de rafraîchissement sont invalidés lors de la déconnexion de l'utilisateur,
      });

      // On retourne une réponse indiquant que le token a été réinitialisé
      return { data: 'All tokens have been deactivated' };
    } catch (error) {
      // Gestion de toute autre erreur qui pourrait survenir
      throw new InternalServerErrorException(ErrorMessages.LOGOUT_ERROR);
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Reset Password @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async resetPasswordDemand(resetPasswordDemandDto: ResetPasswordDemandDto) {
    try {
      const { email } = resetPasswordDemandDto;

      /////////////////  ** On verifie si l'utilisateur est déjà inscrit
      const user = await this.verifyEmailExistence(email);

      /////////////////  ** Envoyer un mail pour suivre les etapes de l'initialisation de mot de passe
      const code = speakeasy.totp({
        // cette methode crée un code à 5 chiffre qui sera envoyé à utilisateur pour reinitialiser son password
        secret: this.configService.get('OTP_CODE'),
        digits: 5, // code à 5 chiffres
        step: 60 * 15, // Durée 15 minutes
        encoding: 'base32', // encodage
      });
      const name = user.name;
      // !!!!!!! Techiniquement, ici il faut une url du frontend !!!!!!
      const url = 'http://localhost:4200/reset-pwd';
      await this.mailerService.sendResetPassword(email, url, code, name);

      return {
        result: true,
        data: 'Reset password and mail has been sent',
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Reset Password Confirmation @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async resetPasswordConfirmation(
    resetPasswordConfirmationDto: ResetPasswordConfirmationDto,
  ) {
    try {
      const { code, email, password } = resetPasswordConfirmationDto;

      /////////////////  ** On verifie si l'utilisateur est déjà inscrit
      const user = await this.verifyEmailExistence(email);

      /////////////////  ** Verifier si code renvoyé est toujours valide
      const match = speakeasy.totp.verify({
        // cette methode verifie le code à 5 chiffre qui a été envoyé à utilisateur pour reinitialiser son password
        secret: this.configService.get('OTP_CODE'), //
        token: code,
        // Ces 3 lignes sont encore nécessaires pour s'On assurer que la vérification du code TOTP est effectuée
        // avec les mêmes critères que ceux utilisés pour générer le code  (TOTP - Time-Based One-Time Password)
        digits: 5, // code à 5 chiffres
        step: 60 * 15, // Durée 15 minutes
        encoding: 'base32', // encodage
      });
      if (!match)
        throw new UnauthorizedException(ErrorMessages.INVALID_RESET_CODE);
      // ///////////////** Hasher le mot de passe
      const hash = await bcrypt.hash(password, 10);
      // ///////////////** On enregistre la modification du password dans la base de données
      await this.prismaService.users.update({
        where: { email },
        data: {
          password: hash,
          tokenVersion: { increment: 1 }, // On incrémente tokenVersion pour invalider les jetons existants
        },
      });

      const name = user.name;

      // Ici j'appelle ma méthode logout pour invalider les sessions existantes
      if (user.userId) {
        await this.logout(user.userId);
      }
      ///////////////// ** Envoyer un mail pour confirmer le changement du mot de passe
      await this.mailerService.sendPasswordChangeConfirmation(email, name);
      // On retourne un Objet Data de confirmation

      return {
        result: true,
        data: 'password updated',
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$   READ  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Users List @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllUsersWithEmailVerifedAndActif() {
    try {
      // Récupération de tous les utilisateurs de la base de données actifs
      const users = await this.prismaService.users.findMany({
        where: {
          verifiedMail: true,
          actif: true,
        },
        select: {
          userId: true,
          roleId: true,
          name: true,
          firstname: true,
          dateBirth: true,
          sex: true,
          phoneNumber: true,
          tvaNumber: true,
          email: true,
          jobTitleId: true,
          experienceId: true,
          createdAt: true,
          cv: true,
          address: true,
          actif: true,
          nameCompany: true,
          descriptionCompany: true,
          addressCompany: true,
          role: {
            select: {
              roleId: true,
              title: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          experience: {
            select: {
              experienceId: true,
              title: true,
            },
          },
        },
      });
      // On verifie si la liste des utilisateurs est vide
      if (users.length === 0) {
        return { message: `No users present in the database.` };
      }
      // On retourne la liste complète des utilisateurs
      return {
        result: true,
        count: users.length,
        data: users,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Users List @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllUsersWithEmailVerifedAndInactif() {
    try {
      // Récupération de tous les utilisateurs de la base de données actifs
      const users = await this.prismaService.users.findMany({
        where: {
          verifiedMail: true,
          OR: [
            // actif peut etre false ou null
            { actif: false },
            { actif: null },
          ],
        },
        select: {
          userId: true,
          roleId: true,
          name: true,
          firstname: true,
          dateBirth: true,
          sex: true,
          phoneNumber: true,
          tvaNumber: true,
          email: true,
          jobTitleId: true,
          experienceId: true,
          actif: true,
          cv: true,
          address: true,
          nameCompany: true,
          descriptionCompany: true,
          addressCompany: true,
          createdAt: true,
          role: {
            select: {
              roleId: true,
              title: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          experience: {
            select: {
              experienceId: true,
              title: true,
            },
          },
        },
      });
      // On verifie si la liste des utilisateurs est vide
      if (users.length === 0) {
        return { message: `No users present in the database.` };
      }
      // On retourne la liste complète des utilisateurs
      return {
        result: true,
        count: users.length,
        data: users,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Users List @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllUsersWithEmailVerifed() {
    try {
      // Récupération de tous les utilisateurs de la base de données actifs
      const users = await this.prismaService.users.findMany({
        where: {
          verifiedMail: true,
        },
        select: {
          userId: true,
          roleId: true,
          actif: true,
          name: true,
          firstname: true,
          dateBirth: true,
          sex: true,
          phoneNumber: true,
          tvaNumber: true,
          email: true,
          jobTitleId: true,
          experienceId: true,
          cv: true,
          address: true,
          nameCompany: true,
          createdAt: true,
          descriptionCompany: true,
          addressCompany: true,
          role: {
            select: {
              roleId: true,
              title: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          experience: {
            select: {
              experienceId: true,
              title: true,
            },
          },
        },
      });
      // On verifie si la liste des utilisateurs est vide
      if (users.length === 0) {
        return { message: `No users present in the database.` };
      }
      // On retourne la liste complète des utilisateurs
      return {
        result: true,
        count: users.length,
        data: users,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Get The Collaborateurs @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Get The Collaborateurs @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllCollaborateurs() {
    try {
      // Récupération de tous les utilisateurs de la base de données actifs
      const users = await this.prismaService.users.findMany({
        where: {
          role: {
            title: 'Consultant',
          },
        },
        select: {
          userId: true,
          roleId: true,
          actif: true,
          name: true,
          firstname: true,
        },
      });

      // Transformation des données pour ajouter la variable dynamique 'consultant'
      const transformedUsers = users.map((user) => ({
        ...user,
        consultant: `${user.firstname} ${user.name}`,
      }));

      // On retourne la liste complète des utilisateurs transformés
      return {
        result: true,
        count: transformedUsers.length,
        data: transformedUsers,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   Confirmation de l'email de l'utilisateur @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async confirmUserEmail(token: string) {
    try {
      const user = await this.prismaService.users.findFirst({
        where: {
          confirmationMailToken: token,
        },
      });
      if (!user) {
        throw new NotFoundException(ErrorMessages.INVALID_REFRESH_TOKEN);
      }
      // On vérifie si le jeton n'a pas expiré
      if (
        user.confirmationMailTokenExpires &&
        new Date() > user.confirmationMailTokenExpires
      ) {
        throw new BadRequestException(ErrorMessages.EMAIL_CONFIRMATION_EXPIRED);
      }
      const userRoleId = user.roleId;
      const email = user.email;
      const name = user.name;

      const role = await this.verifyRoleExistence(userRoleId);
      // On verifie si le rôle est "Administrator" ou "Consultant"
      if (role.title === 'Administrator' || role.title == 'Consultant') {
        // si c'est un consultant ou admin son compte est automatiquement activé
        await this.prismaService.users.update({
          where: { userId: user.userId },
          data: {
            verifiedMail: true,
            actif: true,
            confirmationMailToken: null, // Le jeton est effacé après confirmation
            confirmationMailTokenExpires: null, // La date d'expiration est également  effacée
          },
        });
        // Envoi d'un e-mail au consultant de notification de compte confirmé
        await this.mailerService.sendEmployeeSignupConfirmation(email, name);
      }
      // si c'est un candidat ou un recruiter son compte est soumis a verification avant activation
      await this.prismaService.users.update({
        where: { userId: user.userId },
        data: {
          verifiedMail: true,
          confirmationMailToken: null, // Le jeton est effacé après confirmation
          confirmationMailTokenExpires: null, // La date d'expiration est également  effacée
        },
      });
      // Envoi cette fois-ci d'un e-mail de compte en attente de confirmation par un Consultant
      await this.mailerService.sendSignupAwaitingConfirmation(
        user.email,
        user.name,
      );

      return {
        result: true,
        data: 'emailConfirmationSucess',
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ User Profil Details @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getUserProfile(userId: number) {
    try {
      // On vérifie si l'utilisateur existe
      await this.verifyUsersExistence(userId);

      // Suppression du mot de passe et autres informations sensibles
      const user = await this.prismaService.users.findUnique({
        where: { userId: userId },

        select: {
          userId: true,
          roleId: true,
          actif: true,
          name: true,
          firstname: true,
          dateBirth: true,
          sex: true,
          phoneNumber: true,
          tvaNumber: true,
          email: true,
          interviewNote: true,
          addNote: true,
          jobTitleId: true,
          experienceId: true,
          cv: true,
          address: true,
          nameCompany: true,
          descriptionCompany: true,
          addressCompany: true,
          role: {
            select: {
              roleId: true,
              title: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          experience: {
            select: {
              experienceId: true,
              title: true,
            },
          },
        },
      });
      return {
        result: true,
        data: user,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ User Profil Details by Admin@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getUserProfileByAdmin(userId: number) {
    try {
      // On vérifie si l'utilisateur existe
      await this.verifyUsersExistence(userId);

      // Suppression du mot de passe et autres informations sensibles
      const user = await this.prismaService.users.findUnique({
        where: { userId: userId },

        select: {
          userId: true,
          roleId: true,
          name: true,
          actif: true,
          firstname: true,
          dateBirth: true,
          sex: true,
          phoneNumber: true,
          tvaNumber: true,
          email: true,
          interviewNote: true,
          addNote: true,
          jobTitleId: true,
          experienceId: true,
          cv: true,
          address: true,
          nameCompany: true,
          descriptionCompany: true,
          addressCompany: true,
          role: {
            select: {
              roleId: true,
              title: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          experience: {
            select: {
              experienceId: true,
              title: true,
            },
          },
        },
      });
      return {
        result: true,
        data: user,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Get All ACTIVE USERS BY ROLE ID @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllActiveUsersByRoleId(roleId: number) {
    try {
      const role = await this.verifyRoleExistence(roleId);

      const users = await this.prismaService.users.findMany({
        where: {
          roleId: role.roleId, // Filtre basé sur l'ID du rôle passé en paramètre
          actif: true,
          verifiedMail: true,
        },
        select: {
          userId: true,
          roleId: true,
          actif: true,
          name: true,
          firstname: true,
          dateBirth: true,
          sex: true,
          phoneNumber: true,
          tvaNumber: true,
          email: true,
          jobTitleId: true,
          experienceId: true,
          cv: true,
          address: true,
          nameCompany: true,
          descriptionCompany: true,
          addressCompany: true,
          role: {
            select: {
              roleId: true,
              title: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          experience: {
            select: {
              experienceId: true,
              title: true,
            },
          },
        },
      });

      // Vérifie si la liste des utilisateurs est vide
      if (users.length === 0) {
        return { message: `Aucun utilisateur trouvé pour le rôle spécifié.` };
      }

      // Retourne la liste complète des utilisateurs pour le rôle spécifié
      return {
        result: true,
        count: users.length,
        data: users,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Gestion des erreurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ (New Accoupt created) Get All INACTIVE USERS BY ROLE ID @@@@@@@@@@@@@@@@
  async getAllInactiveUsersByRoleId(roleId: number) {
    try {
      const role = await this.verifyRoleExistence(roleId);

      const users = await this.prismaService.users.findMany({
        where: {
          actif: null,
          verifiedMail: true,
          roleId: role.roleId, // Filtre basé sur l'ID du rôle passé en paramètre
        },
        select: {
          userId: true,
          roleId: true,
          actif: true,
          name: true,
          firstname: true,
          dateBirth: true,
          sex: true,
          phoneNumber: true,
          tvaNumber: true,
          email: true,
          jobTitleId: true,
          experienceId: true,
          cv: true,
          address: true,
          nameCompany: true,
          descriptionCompany: true,
          addressCompany: true,
          role: {
            select: {
              roleId: true,
              title: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          experience: {
            select: {
              experienceId: true,
              title: true,
            },
          },
        },
      });

      // Vérifie si la liste des utilisateurs est vide
      if (users.length === 0) {
        return { message: `Aucun utilisateur trouvé pour le rôle spécifié.` };
      }

      // Retourne la liste complète des utilisateurs pour le rôle spécifié
      return {
        result: true,
        data: users,
        count: users.length,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Gestion des erreurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Méthode pour afficher le CV d'un utilisateur @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getUserCV(userId: number): Promise<{
    result: boolean;
    data: { cvUrl: string };
    error_code: null;
    error: null;
  }> {
    try {
      // On recupère le chemin vers le cv
      const user = await this.verifyUsersExistence(userId);

      // On verifie si l'utilisateur a bien un CV attaché a son compte
      if (!user || !user.cv) {
        throw new NotFoundException(ErrorMessages.USER_NOT_CV);
      }

      // on Construire le chemin complet vers le fichier CV
      const filePath = path.join(process.cwd(), 'uploads', user.cv);

      // On utilise la version asynchrone de la bibliothèque "fs.promises" pour vérifier si le fichier existe.
      try {
        await fs.promises.access(filePath, fs.constants.F_OK);
      } catch {
        throw new NotFoundException(ErrorMessages.USER_NOT_CV);
      }

      // On recupere la base URL declarée dans notre environnement (.env)
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

      const cvUrl = `${baseUrl}/uploads/${user.cv}`;

      // On retourne une réponse de succès
      return {
        result: true,
        data: {
          cvUrl: cvUrl,
        }, // On envoie l'URL du CV
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Cherche des utilisateurs en fonction d'un mot-clé @@@@@@@@@@@@@@@@@@@@@@@@
  async searchUsers(keyword: string) {
    try {
      const users = await this.prismaService.users.findMany({
        where: {
          verifiedMail: true,
          OR: [
            { name: { contains: keyword } },
            { firstname: { contains: keyword } },
            { email: { contains: keyword } },
            { jobTitle: { title: { contains: keyword } } },
            { experience: { title: { contains: keyword } } },
          ],
        },
        select: {
          userId: true,
          roleId: true,
          actif: true,
          name: true,
          firstname: true,
          dateBirth: true,
          sex: true,
          phoneNumber: true,
          tvaNumber: true,
          email: true,
          jobTitleId: true,
          experienceId: true,
          cv: true,
          address: true,
          nameCompany: true,
          descriptionCompany: true,
          addressCompany: true,
          role: {
            select: {
              roleId: true,
              title: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          experience: {
            select: {
              experienceId: true,
              title: true,
            },
          },
        },
      });

      // Vérifie si la liste des utilisateurs est vide
      if (users.length === 0) {
        return { message: `Aucun utilisateur correspondant trouvé.` };
      }

      // Retourne la liste complète des utilisateurs pour le rôle spécifié
      return {
        result: true,
        count: users.length,
        data: users,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Gestion des erreurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Chercher un comptes non validé par un mot clé @@@@@@@@@@@@@@@@@@@@@@@@
  async searchUsersInvalidate(keyword: string) {
    try {
      const users = await this.prismaService.users.findMany({
        where: {
          AND: [
            {
              verifiedMail: true,
              OR: [{ actif: null }, { actif: false }],
            },
          ],
          OR: [
            { name: { contains: keyword } },
            { firstname: { contains: keyword } },
            { email: { contains: keyword } },
            {
              jobTitle: {
                is: { title: { contains: keyword } },
              },
            },
            {
              experience: {
                is: { title: { contains: keyword } },
              },
            },
          ],
        },
        select: {
          userId: true,
          roleId: true,
          actif: true,
          name: true,
          firstname: true,
          dateBirth: true,
          sex: true,
          phoneNumber: true,
          tvaNumber: true,
          email: true,
          jobTitleId: true,
          experienceId: true,
          cv: true,
          address: true,
          nameCompany: true,
          descriptionCompany: true,
          addressCompany: true,
          role: {
            select: {
              roleId: true,
              title: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          experience: {
            select: {
              experienceId: true,
              title: true,
            },
          },
        },
      });

      // Vérifie si la liste des utilisateurs est vide
      if (users.length === 0) {
        return { message: `Aucun utilisateur correspondant trouvé.` };
      }

      // Retourne la liste complète des utilisateurs pour le rôle spécifié
      return {
        result: true,
        count: users.length,
        data: users,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Gestion des erreurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Chercher un comptes validé par un mot clé @@@@@@@@@@@@@@@@@@@@@@@@
  async searchUsersValidate(keyword: string) {
    try {
      const users = await this.prismaService.users.findMany({
        where: {
          actif: true,
          verifiedMail: true,
          OR: [
            { name: { contains: keyword } },
            { firstname: { contains: keyword } },
            { email: { contains: keyword } },
            {
              jobTitle: {
                is: { title: { contains: keyword } },
              },
            },
            {
              experience: {
                is: { title: { contains: keyword } },
              },
            },
          ],
        },

        select: {
          userId: true,
          roleId: true,
          actif: true,
          name: true,
          firstname: true,
          dateBirth: true,
          sex: true,
          phoneNumber: true,
          tvaNumber: true,
          email: true,
          jobTitleId: true,
          experienceId: true,
          cv: true,
          address: true,
          nameCompany: true,
          descriptionCompany: true,
          addressCompany: true,
          role: {
            select: {
              roleId: true,
              title: true,
            },
          },
          jobTitle: {
            select: {
              title: true,
            },
          },
          experience: {
            select: {
              experienceId: true,
              title: true,
            },
          },
        },
      });

      // Vérifie si la liste des utilisateurs est vide
      if (users.length === 0) {
        return { message: `Aucun utilisateur correspondant trouvé.` };
      }

      // Retourne la liste complète des utilisateurs pour le rôle spécifié
      return {
        result: true,
        count: users.length,
        data: users,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Gestion des erreurs
      throw error;
    }
  }


  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Employess List @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllEmployees() {
    try {
      // Récupération de tous les utilisateurs de la base de données actifs
      const users = await this.prismaService.users.findMany({
        where: {
          actif: true,
          verifiedMail: true,
          role: {
            title: {
              in: ['Administrator', 'Consultant'], // Permet de filtrer les utilisateurs ayant le titre "Consultant" ou "e"
            },
          },
        },
        include: {
          role: true, // Inclusion des détails du rôle dans la réponse
        },
      });
      // On verifie si la liste des utilisateurs est vide
      if (users.length === 0) {
        return { message: 'No employees present in the database' };
      }
      // On retourne la liste complète des utilisateurs

      return {
        result: true,
        data: users,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Inactive Employees List @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllEmployeesNotEnable() {
    try {
      // Récupération de tous les utilisateurs de la base de données qui sont non actifs
      const users = await this.prismaService.users.findMany({
        where: {
          actif: null,
          verifiedMail: true,
          role: {
            title: {
              in: ['Administrator', 'Consultant'], // Permet de filtrer les utilisateurs ayant le titre "Consultant" ou "Administrator"
            },
          },
        },
        include: {
          role: true, // Inclusion des détails du rôle dans la réponse
        },
      });
      // On verifie si la liste des utilisateurs est vide
      if (users.length === 0) {
        return { message: `No employees present in the database.` };
      }
      // On retourne la liste complète des utilisateurs
      return {
        result: true,
        data: users,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ List, Inactive  Employees Account with mail not verifed by Employees  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllEmployeesAccountWithMailNotVerifed() {
    try {
      // Récupération de tous les compte de la base de données qui ont des emails non verifié
      const users = await this.prismaService.users.findMany({
        where: {
          verifiedMail: false,
          role: {
            title: {
              in: ['Administrator', 'Consultant'], // Permet de filtrer les utilisateurs ayant le titre "Consultant" ou "Candidat"
            },
          },
        },
        include: {
          role: true, // Inclusion des détails du rôle dans la réponse
        },
      });
      // On verifie si la liste des utilisateurs est vide
      if (users.length === 0) {
        return {
          message: 'No Employee unverified account present in the database',
        };
      }
      // On retourne la liste complète des utilisateurs
      return {
        result: true,
        data: users,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Accounts with Confirmation by Mail Token are Expired @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAccountWithConfirmationMailTokenExpired() {
    try {
      const now = new Date();
      const expiredUsers = await this.prismaService.users.findMany({
        where: {
          AND: [
            { confirmationMailToken: { not: null } }, // On assure que l'utilisateur a un token de confirmation
            { confirmationMailTokenExpires: { lt: now } }, // Vérifie si le token a expiré
            { verifiedMail: false }, // On assure que l'email n'a pas encore été vérifié
          ],
        },
        include: {
          role: true, // Include role details in the response if needed
        },
      });

      if (expiredUsers.length === 0) {
        return {
          message: 'No accounts with expired confirmation tokens found.',
        };
      }

      // On retourne la liste complète des Recruiters
      return {
        result: true,
        data: expiredUsers,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Inactive  Account with mail by "Recruiter", "Candidate"List @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllRecruiterCandidateAccountWithMailNotVerifed() {
    try {
      // Récupération de tous les compte de la base de données qui ont des emails non verifié
      const users = await this.prismaService.users.findMany({
        where: {
          verifiedMail: false,
          role: {
            title: {
              in: ['Recruiter', 'Candidate'], // Permet de filtrer les utilisateurs ayant le titre "Consultant" ou "Candidate"
            },
          },
        },
        include: {
          role: true, // Inclusion des détails du rôle dans la réponse
        },
      });
      // On verifie si la liste des utilisateurs est vide
      if (users.length === 0) {
        return {
          message:
            'No Consultant, Administrator unverified account present in the database',
        };
      }
      // On retourne la liste complète des utilisateurs
      return {
        result: true,
        data: users,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Inactivated  Users List @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllUsersNotActivated() {
    try {
      // Récupération de tous les utilisateurs de la base de données qui sont non actifs
      const users = await this.prismaService.users.findMany({
        where: {
          actif: null,
          verifiedMail: true,
          role: {
            title: {
              in: ['Recruiter', 'Candidate'], // Permet de filtrer les utilisateurs ayant le titre "Consultant" ou "Candidate"
            },
          },
        },
        include: {
          role: true, // Inclusion des détails du rôle dans la réponse
        },
      });
      // On verifie si la liste des utilisateurs est vide
      if (users.length === 0) {
        return { message: `No users present in the database.` };
      }
      // On retourne la liste complète des utilisateurs
      return {
        result: true,
        data: users,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ All Administrators @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllUsersAdministrators() {
    try {
      const administrators = await this.prismaService.users.findMany({
        where: {
          actif: true,
          verifiedMail: true,
          role: { title: 'Administrator' },
        },
      });
      // On verifie si la liste des utilisateurs est vide
      if (administrators.length === 0) {
        return { message: `No administrators found in the database.` };
      }
      // On retourne la liste complète des administrateurs
      return {
        result: true,
        data: administrators,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ All Consultants @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllUsersConsultants() {
    try {
      const Consultants = await this.prismaService.users.findMany({
        where: {
          actif: true,
          verifiedMail: true,
          role: { title: 'Consultant' },
        },
      });
      // On verifie si la liste des Consultants est vide
      if (Consultants.length === 0) {
        return { message: `No Consultants found in the database.` };
      }
      // On retourne la liste complète des Consultants
      return {
        result: true,
        data: Consultants,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ All Recruiters @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllUsersRecruiters() {
    try {
      const Recruiters = await this.prismaService.users.findMany({
        where: {
          actif: true,
          verifiedMail: true,
          role: { title: 'Recruiter' },
        },
      });
      // On verifie si la liste des Recruiters est vide
      if (Recruiters.length === 0) {
        return { message: `No Recruiters found in the database.` };
      }
      // On retourne la liste complète des Recruiters
      return {
        result: true,
        data: Recruiters,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ All Candidates @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async getAllUsersCandidates() {
    try {
      const Candidates = await this.prismaService.users.findMany({
        where: {
          actif: true,
          verifiedMail: true,
          role: { title: 'Candidate' },
        },
      });
      // On verifie si la liste des Candidates est vide
      if (Candidates.length === 0) {
        return { message: `No Candidates found in the database.` };
      }
      // On retourne la liste complète des Candidates
      return {
        result: true,
        data: Candidates,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ All Company @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  async getAllCompany() {
    try {
      const company = await this.prismaService.users.findMany({
        where: {
          actif: true,
          verifiedMail: true,
          role: { title: 'Recruiter' },
        },
        select: {
          userId: true,
          name: true,
          firstname: true,
          nameCompany: true,
          descriptionCompany: true,
          addressCompany: true,
          tvaNumber: true,
        },
      });
      // On verifie si la liste des Candidates est vide
      if (company.length === 0) {
        return { message: `No Compagny found in the database.` };
      }

      // On retourne la liste complète des nom de company
      return {
        result: true,
        data: {
          count: company.length, // Le nombre total fonctions
          company: company, // La liste des fonctions correspondants
        },
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Update Notification @@@@@@@@@@@@@@@@@@@@
  async updateEmailNotification(
    userId: number,
    updateNotificationDto: UpdateNotificationDto,
  ) {
    try {
      // On verifie si l'utilisateur existe
      await this.verifyUsersExistence(userId);
      // Mettre à jour seulement certains champs autorisés pour les utilisateurs standard
      const { notification } = updateNotificationDto;
      // Mettre à jour l'utilisateur
      const updatedUserNotification = await this.prismaService.users.update({
        where: { userId },
        data: {
          notification,
        },
      });

      // On retourne la liste complète des nom de company
      return {
        result: true,
        data: updatedUserNotification,
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Valider ou non un utilisateur enregistré @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async validateUser(
    userIdToUpdate: number,
    requestUserId: number,
    validateUsersDto: ValidateUsersDto,
  ) {
    try {
      const { actif, noteInscription } = validateUsersDto;

      // Récupérer les informations de l'utilisateur demandant la modification
      const requestUser = await this.verifyUsersExistence(requestUserId);
      const consultantName = requestUser.firstname + ' ' + requestUser.name;

      // Récupérer les informations de l'utilisateur à modifier
      const userToUpdate = await this.verifyUsersExistence(userIdToUpdate);

      // On vérifie  si l'utilisateur a dejà verifié son adresse mail
      if (!userToUpdate.verifiedMail) {
        throw new BadRequestException(ErrorMessages.UNVERIFIED_EMAIL);
      }
      // Si l'utilisateur demandeur de la requete est un Consultant, autoriser uniquement la modification des rôles "Recruiter" et "Candidate"
      if (
        requestUser.role.title === 'Consultant' &&
        userToUpdate.role.title !== 'Recruiter' &&
        userToUpdate.role.title !== 'Candidate'
      ) {
        throw new UnauthorizedException(ErrorMessages.CANDIDATE_ROLE_ONLY);
      }

      // On vérifie  si l'utilisateur a déjà été validé ou non
      if (userToUpdate.actif && actif) {
        // L'utilisateur a déjà le statut souhaité, On retourne un message indiquant que l'action a déjà été effectuée
        
        throw new BadRequestException(ErrorMessages.ACCOUNT_ALREADY_VERIFIED);
      }

      // Email de l'utilisateur
      const email = userToUpdate.email;
      const name = userToUpdate.name;

      if (actif) {
        // Mettre à jour l'utilisateur comme validé
        await this.prismaService.users.update({
          where: { userId: userIdToUpdate },
          data: {
            actif: actif,
            checkUserConsultant: consultantName,
            //    noteInscription: null
          },
        });
        // Envoyer un email de confirmation
        await this.mailerService.sendSignupConfirmation(email, name);
      } else {
        // Si le compte doit être refusé et que le consultant a fourni une note explicative
        if (noteInscription && noteInscription.length > 20) {
          // Mettre à jour la note d'inscription de l'utilisateur avec la note explicative fournie
          await this.prismaService.users.update({
            where: { userId: userIdToUpdate },
            data: {
              noteInscription,
              checkUserConsultant: consultantName,
            },
          });
          // On envoie un email de non-confirmation incluant la note explicative
          await this.mailerService.sendSignupNotConfirmation(
            email,
            noteInscription,
            name,
          );
        } else {
        
          throw new BadRequestException(ErrorMessages.INVALID_VALIDATION_NOTE_LENGTH);
        }

        const cvPath = userToUpdate.cv;

        // Supprimer le fichier CV si présent
        if (cvPath) {
          await this.deleteCvFile(cvPath);
        }
        /*   // Supprimer l'enregistrement de l'utilisateur
        await this.prismaService.users.delete({
          where: { userId: userIdToUpdate },
        }); */
      }

      // On retourne la liste complète des fonctions
      return {
        result: true,
        data: 'Utilisateur mis à jour avec succès',
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Upload CV @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async updateCvUploaded(
    requestingUserId: number,
    cvFile: Express.Multer.File,
  ): Promise<any> {
    try {
      if (!cvFile) {
        throw new BadRequestException(ErrorMessages.NO_CV);
      }
      // On verifie que le fichier est un PDF
      else if (cvFile.mimetype !== 'application/pdf' || !this.isPDF(cvFile)) {
        await this.deleteFile(cvFile.path); // Supprimer le fichier
        throw new BadRequestException(ErrorMessages.INVALID_FILE_FORMAT);
      }
      // On verifie la taille du fichier
      const maxFileSize = 1 * 1024 * 1024; // 1MB
      if (cvFile.size > maxFileSize) {
        await this.deleteFile(cvFile.path); // Supprimer le fichier
        throw new BadRequestException(ErrorMessages.FILE_TOO_LARGE);
      }

      const user = await this.verifyUsersExistence(requestingUserId);

      const oldCvPath = user.cv;
      const cvPath = cvFile.filename;

      const candidateCV = await this.prismaService.users.update({
        where: { userId: requestingUserId },
        data: { cv: cvPath },
      });
      // Si un ancien CV existe, je le supprime
      if (oldCvPath && existsSync(oldCvPath)) {
        try {
          await unlink(oldCvPath);
        } catch (error) {
          console.error(
            "Erreur lors de la suppression de l'ancien fichier CV:",
            error,
          );
        }
      }

      // Réponse de succès avec la structure de données attendue
      return {
        result: true,
        data: candidateCV, // retourne les objets jobsSaved complets
        error_code: null,
        error: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateCandidateInterviewNote(
    userId: number,
    updateUserCandidateDto: UpdateProfileCandidateDto,
  ) {
    try {
      // Décomposer tous les champs du DTO
      const { interviewNote } = updateUserCandidateDto;
      // On verifie si le user existe
      await this.verifyUsersExistence(userId);

      // On verifie la longueur de la description
      if (
        !interviewNote ||
        interviewNote.length < 10 ||
        interviewNote.length > 2500
      ) {
        throw new BadRequestException(ErrorMessages.NOTE_MUST_2500_CHARS);
      }

      await this.prismaService.users.update({
        where: { userId: userId },
        data: {
          interviewNote,
        },
        select: {
          userId: true,
          name: true,
          firstname: true,
          interviewNote: true,
        },
      });

      // On retourne la liste complète des utilisateurs
      return {
        result: true,
        data: 'Note added succesfull',
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Update Profile Recruiter @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async updateProfileRecruiter(
    requestingUserId: number,
    updateUserRecruiterDto: UpdateProfileRecruiterDto,
  ) {
    try {
      // On verifie si le user existe
      await this.verifyUsersExistence(requestingUserId);
      // Vérification de l'âge si une nouvelle date de naissance est fournie
      if (
        updateUserRecruiterDto.dateBirth &&
        !this.isAgeValid(updateUserRecruiterDto.dateBirth)
      ) {
        throw new BadRequestException(ErrorMessages.USER_UNDERAGE);
      }

      // On verifie la longueur de la description
      if (
        !updateUserRecruiterDto.descriptionCompany ||
        updateUserRecruiterDto.descriptionCompany.length < 10 ||
        updateUserRecruiterDto.descriptionCompany.length > 1500
      ) {
        throw new BadRequestException(ErrorMessages.INVALID_DESCRIPTION_LENGTH);
      }

      // On verifie si le sexe est ecrit comme recommandé
      await this.verifyUserSex(updateUserRecruiterDto.sex);

      // On vérifie si le numero est au format valide.
      await this.isValidphoneNumber(updateUserRecruiterDto.phoneNumber);

      // Décomposer tous les champs du DTO
      const {
        name,
        firstname,
        dateBirth,
        sex,
        phoneNumber,
        tvaNumber,
        nameCompany,
        addressCompany,
        descriptionCompany,
      } = updateUserRecruiterDto;
      // Modifier l'utilisateur
      const updatedProfileRecruiter = await this.prismaService.users.update({
        where: { userId: requestingUserId },
        data: {
          name,
          firstname,
          dateBirth,
          sex,
          phoneNumber,
          tvaNumber,
          nameCompany,
          addressCompany,
          descriptionCompany,
        },
        select: {
          userId: true,
          name: true,
          firstname: true,
          dateBirth: true,
          sex: true,
          phoneNumber: true,
          email: true,
          jobTitleId: true,
          address: true,
          actif: true,
          roleId: true,
          nameCompany: true,
          descriptionCompany: true,
          tvaNumber: true,
          addressCompany: true,
          verifiedMail: true,
          notification: true,
        },
      });
      // On retourne une réponse de succès
      return {
        result: true,
        data: {
          userId: updatedProfileRecruiter.userId,
          name: updatedProfileRecruiter.name,
          firstname: updatedProfileRecruiter.firstname,
          email: updatedProfileRecruiter.email,
        },
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Update Profile Emplyee @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async updateProfileEmployee(
    requestingUserId: number,
    updateProfileEmplyee: UpdateProfileEmplyee,
  ) {
    try {
      // Décomposer tous les champs du DTO
      const { name, firstname, dateBirth, sex, phoneNumber, address } =
        updateProfileEmplyee;

      if (
        updateProfileEmplyee.dateBirth &&
        !this.isAgeValid(updateProfileEmplyee.dateBirth)
      ) {
        throw new BadRequestException(ErrorMessages.USER_UNDERAGE);
      }

      // On verifie si le sexe est ecrit comme recommandé
      await this.verifyUserSex(updateProfileEmplyee.sex);

      // On vérifie si le numero est au format valide.
      await this.isValidphoneNumber(updateProfileEmplyee.phoneNumber);

      // Modifier l'utilisateur
      const updatedProfileEmployee = await this.prismaService.users.update({
        where: { userId: requestingUserId },
        data: {
          name,
          firstname,
          dateBirth,
          sex,
          phoneNumber,
          address,
        },
        select: {
          userId: true,
          name: true,
          firstname: true,
          dateBirth: true,
          sex: true,
          phoneNumber: true,
          address: true,
          actif: true,
          email: true,
          verifiedMail: true,
          notification: true,
          roleId: true,
        },
      });

      // On retourne une réponse de succès
      return {
        result: true,
        data: {
          userId: updatedProfileEmployee.userId,
          name: updatedProfileEmployee.name,
          firstname: updatedProfileEmployee.firstname,
          email: updatedProfileEmployee.email,
        },
        error_code: null,
        error: null,
      };
    } catch (error) {
      // Relance l'erreur pour qu'elle soit gérée ailleurs
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   Update User By Admin @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async updateUserByConsultant(
    userIdToUpdate: number,
    requestUserId: number,
    updateUserByConsultantDto: UpdateUserByConsultantDto,
  ) {
    // Récupérer les informations de l'utilisateur demandant la modification
    const requestUser = await this.verifyUsersExistence(requestUserId);

    // on recupère le nom et prenom du consultant traitant
    const consultantName = requestUser.name + ' ' + requestUser.firstname;

    // Empêcher l'auto-modification
    if (userIdToUpdate === requestUserId) {
      throw new UnauthorizedException(ErrorMessages.SELF_MODIFICATION_NOT_ALLOWED);
    }
    // Récupérer les informations de l'utilisateur à modifier

    const userToUpdate = await this.verifyUsersExistence(userIdToUpdate);

    // Si l'utilisateur demandeur de la requete est un Consultant, autoriser uniquement la modification des rôles "Recruiter" et "Candidate"
    if (
      requestUser.role.title === 'Consultant' &&
      userToUpdate.role.title !== 'Recruiter' &&
      userToUpdate.role.title !== 'Candidate'
    ) {
      throw new BadRequestException(ErrorMessages.CONSULTANT_PERMISSION_DENIED);
    }

    // On vérifie  si l'utilisateur a dejà verifié son adresse mail
    if (!userToUpdate.verifiedMail) {
      return {
        data: `Cet utilisateur n'a pas encore confirmé son adresse mail.`,
      };
    }

    // Vérification de l'âge si une nouvelle date de naissance est fournie
    if (
      updateUserByConsultantDto.dateBirth &&
      !this.isAgeValid(updateUserByConsultantDto.dateBirth)
    ) {
      throw new BadRequestException(ErrorMessages.USER_UNDERAGE);
    }

    // On verifie si le sexe est ecrit comme recommandé
    await this.verifyUserSex(updateUserByConsultantDto.sex);

    // Décomposer tous les champs du DTO
    const { name, firstname, ...rest } = updateUserByConsultantDto;

    // Modifier l'utilisateur
    const updatedUser = await this.prismaService.users.update({
      where: { userId: userIdToUpdate },
      data: {
        checkUserConsultant: consultantName,
        name,
        firstname,
        ...rest,
      },
      select: {
        userId: true,
        name: true,
        firstname: true,
        dateBirth: true,
        sex: true,
        phoneNumber: true,
        email: true,
        jobTitleId: true,
        cv: true,
        address: true,
        nameCompany: true,
        addressCompany: true,
        notification: true,
        actif: true,
        roleId: true,
        checkUserConsultant: true,
      },
    });
    // L'utilisateur est retourné sans le mot de passe
    return updatedUser;
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Admin Update By Admin  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async updateEmplyeeByAdminDto(
    userIdToUpdate: number,
    requestUserId: number,
    updateEmplyeeByAdminDto: UpdateEmplyeeByAdminDto,
  ) {
    // Récupérer les informations de l'utilisateur demandant la modification

    const requestUser = await this.verifyUsersExistence(requestUserId);

    const consultantName = requestUser.name + ' ' + requestUser.firstname;

    // Empêcher l'auto-modification
    if (userIdToUpdate === requestUserId) {
    
      throw new UnauthorizedException(ErrorMessages.SELF_MODIFICATION_NOT_ALLOWED);
    }
    // Récupérer les informations de l'utilisateur à modifier
    const userToUpdate = await this.verifyUsersExistence(userIdToUpdate);

    // Autoriser uniquement la modification des rôles "Administrator" ou "Consultant"
    if (
      userToUpdate.role.title !== 'Administrator' &&
      userToUpdate.role.title !== 'Consultant'
    ) {
    
      throw new BadRequestException(ErrorMessages.ADMIN_OR_CONSULTANT_ONLY);
    }

    // Vérification de l'âge si une nouvelle date de naissance est fournie
    if (
      updateEmplyeeByAdminDto.dateBirth &&
      !this.isAgeValid(updateEmplyeeByAdminDto.dateBirth)
    ) {
      throw new BadRequestException(ErrorMessages.USER_UNDERAGE);
    }
    // On verifie si le sexe est ecrit comme recommandé
    await this.verifyUserSex(updateEmplyeeByAdminDto.sex);

    // On verifie qu'il ne reatribue pas un autre role que "Administrator" ou "Consultant"
    await this.checkAdminConsultantRole(updateEmplyeeByAdminDto.roleId);

    // Décomposer tous les champs du DTO
    const { name, firstname, ...rest } = updateEmplyeeByAdminDto;

    // Modifier l'utilisateur
    const updatedUser = await this.prismaService.users.update({
      where: { userId: userIdToUpdate },
      data: {
        checkUserConsultant: consultantName,
        name,
        firstname,
        ...rest,
      },
      select: {
        userId: true,
        name: true,
        firstname: true,
        dateBirth: true,
        sex: true,
        phoneNumber: true,
        email: true,
        jobTitle: true,
        address: true,
        actif: true,
        roleId: true,
        checkUserConsultant: true,
      },
    });
    // L'utilisateur est retourné sans le mot de passe
    return updatedUser;
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   Update Profile Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async updateProfileCandidate(
    requestingUserId: number,
    updateUserCandidateDto: UpdateProfileCandidateDto,
  ) {
    // On verifie si le user existe

    await this.verifyUsersExistence(requestingUserId);

    // On verifie l'existence de l'intitulé de l'experience dans la base de données
    await this.experienceService.verifyExperienceExistence(
      updateUserCandidateDto.experienceId,
    );

    // Vérification de l'âge si une nouvelle date de naissance est fournie
    if (
      updateUserCandidateDto.dateBirth &&
      !this.isAgeValid(updateUserCandidateDto.dateBirth)
    ) {
      throw new BadRequestException(ErrorMessages.USER_UNDERAGE);
    }
    // On verifie si le sexe est ecrit comme recommandé
    await this.verifyUserSex(updateUserCandidateDto.sex);

    // On vérifie si le numero est au format valide.
    await this.isValidphoneNumber(updateUserCandidateDto.phoneNumber);

    // Décomposer tous les champs du DTO
    const {
      name,
      firstname,
      dateBirth,
      sex,
      phoneNumber,
      jobTitleId,
      experienceId,
      address,
    } = updateUserCandidateDto;
    // Modifier l'utilisateur
    const updatedProfileCandidate = await this.prismaService.users.update({
      where: { userId: requestingUserId },
      data: {
        name,
        firstname,
        dateBirth,
        sex,
        phoneNumber,
        jobTitleId,
        experienceId,
        address,
      },
      select: {
        userId: true,
        name: true,
        firstname: true,
        dateBirth: true,
        sex: true,
        phoneNumber: true,
        email: true,
        jobTitleId: true,
        address: true,
        actif: true,
        experienceId: true,
        verifiedMail: true,
        notification: true,
        roleId: true,
      },
    });
    // L'utilisateur est retourné sans le mot de passe
    return updatedProfileCandidate;
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   DELETE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete User By Admin @@@@@@@@@@@@@@@@@@
  async deleteUserByAdmin(userIdToDelete: number, requestUserId: number) {
    try {
      // Récupérer les informations de l'utilisateur demandant la suppression
      const requestUser = await this.verifyUsersExistence(requestUserId);

      // Empêcher l'auto-suppression
      if (userIdToDelete === requestUserId) {
      
        throw new UnauthorizedException(ErrorMessages.CANNOT_SELF_DELETE);
      }
      // Récupérer les informations de l'utilisateur à supprimer
      const userToDelete = await this.verifyUsersExistence(userIdToDelete);
      const roleOfUserToDelete = userToDelete.role.title;

      // On verifie les rôles pour autoriser la suppression
      //   1. Permettre à un administrateur de supprimer n'importe quel utilisateur, sauf lui-même.
      //   2. Permettre à un consultant de supprimer des utilisateurs ayant les rôles "Recruiter" et "Candidate",
      //    mais pas d'autres consultants ou des administrateurs, et pas lui-même.
      if (
        requestUser.role.title === 'Consultant' &&
        (roleOfUserToDelete === 'Administrator' ||
          roleOfUserToDelete === 'Consultant')
      ) {
      
        throw new UnauthorizedException(ErrorMessages.INSUFFICIENT_PERMISSION);
      }

      // On garde le chemin du CV avant de supprimer l'utilisateur
      const cvPath = userToDelete.cv;

      // Début d'une transaction (Pour la suppression en Cascade)
      await this.deleteUsersOnCascade(userIdToDelete);

      // On supprimer le fichier CV si présent
      if (cvPath) {
        await this.deleteCvFile(cvPath);
      }

      // Réponse de succès avec la structure de données attendue
      return {
        result: true,
        data: `Utilisateur supprimé avec succès.`, // retourne les objets jobsSaved complets
        error_code: null,
        error: null,
      };
    } catch (error) {
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete Profile  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  async deleteProfile(requestUserId: number) {
    try {
      /////////////////  ** On verifie si l'utilisateur est déjà inscrit
      const accountToDelete = await this.verifyUsersExistence(requestUserId);

      // On evite que le dernier Administrateur supprime son compte
      await this.checkLastAdminBeforeDeletion(accountToDelete.userId);

      if (accountToDelete.role.title === 'Consultant') {

        throw new UnauthorizedException(ErrorMessages.ONLY_ADMIN_CAN_DELETE);

        
      }
      /////////////////  ** Comparer le mot de passe
      /* const match = await bcrypt.compare(password, accountToDelete.password);
    if (!match) throw new UnauthorizedException('Password does not match'); */
      // On garde le chemin du CV avant de supprimer l'utilisateur
      const cvPath = accountToDelete.cv;
      const email = accountToDelete.email;
      const name = accountToDelete.name;
      // Début d'une transaction (Pour la suppression en Cascade)
      await this.deleteUsersOnCascade(accountToDelete.userId);
      //  await this.prismaService.users.delete({ where: { userId: accountToDelete.userId } });
      // Mail pour confirmer la suppression du compte et dire que toutes sont donnees sont effacees dans notre BD
      await this.mailerService.sendDeleteAccountConfirmation(email, name);
      // On supprimer le fichier CV si présent
      if (cvPath) {
        await this.deleteCvFile(cvPath);
      }
      return {
        result: true,
        data: `User successfully deleted.`,
        error_code: null,
        error: null,
      };
    } catch (error) {
      throw error;
    }
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Deleting all inactive accounts with expired confirmationMailTokenExpires @@@@@@@@@@@@@
  async deleteExpiredConfirmationTokens() {
    const now = new Date();
    const result = await this.prismaService.users.deleteMany({
      where: {
        AND: [
          { confirmationMailToken: { not: null } },
          { confirmationMailTokenExpires: { lt: now } },
          { verifiedMail: false },
        ],
      },
    });
    if (result.count > 0) {
      // result.count contiendra le nombre de comptes supprimés

      return {
        message: `Nombre de comptes non verifiés supprimés est: ${result.count}`,
      };
    }
    return {
      message: `Il n'y a aucun compte non validé dans la Base de données`,
    };
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   Fonctions Privée  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  /////////////////////////** Vérification du nombre limite d'administrateurs **//////////////////////////////////
  private async checkAdminCountLimit(roleId: number): Promise<void> {
    // On verifie si le rôle est celui d'un administrateur
    const adminRole = await this.prismaService.roles.findUnique({
      where: { roleId },
    });

    if (!adminRole || adminRole.title !== 'Administrator') {
      // Si ce n'est pas un rôle d'administrateur, on ne fait rien
      return;
    }
    const adminCount = await this.prismaService.users.count({
      where: { roleId: adminRole.roleId },
    });
    if (adminCount >= 3) {

      throw new BadRequestException(ErrorMessages.ADMIN_LIMIT_REACHED);
    }
  }
  /////////////////////////** Vérification du nombre limite d'administrateurs **//////////////////////////////////
  private async checkAdminConsultantRole(roleId: number): Promise<void> {
    // On verifie si le rôle est celui d'un administrateur ou Consultant
    const AdminConsultantRole = await this.prismaService.roles.findUnique({
      where: { roleId },
    });
    if (
      AdminConsultantRole.title !== 'Administrator' &&
      AdminConsultantRole.title !== 'Consultant'
    ) {
      // Si ce n'est pas un rôle d'administrateur, on ne fait rien
      throw new BadRequestException(ErrorMessages.INVALID_ROLE);
    }
  }
  //////////////////////** Vérification des privilèges d'administrateur pour certains rôles///////////////////////
  async checkLastAdminBeforeDeletion(userIdToDelete: number): Promise<void> {
    // Je cherche le rôle d'administrateur dans la base de données
    const adminRole = await this.prismaService.roles.findFirst({
      where: { title: 'Administrator' },
    });
    // Je vérifie si le rôle d'administrateur a été trouvé
    if (!adminRole) 
    throw new BadRequestException(ErrorMessages.ADMIN_ROLE_FOUND);
    // Je compte le nombre total d'utilisateurs ayant le rôle d'administrateur
    const adminCount = await this.prismaService.users.count({
      where: { roleId: adminRole.roleId },
    });
    // Je recherche l'utilisateur à supprimer dans la base de données
    const userToDelete = await this.prismaService.users.findUnique({
      where: { userId: userIdToDelete },
    });
    // Je vérifie si l'utilisateur à supprimer a été trouvé
    if (!userToDelete) throw new NotFoundException('Utilisateur introuvable.');
    // Si l'utilisateur à supprimer est un administrateur et qu'il est le dernier ou l'unique administrateur
    // Je renvoie un message d'erreur indiquant qu'on ne peut pas supprimer le dernier administrateur
    if (userToDelete.roleId === adminRole.roleId && adminCount <= 1) {
      throw new BadRequestException(ErrorMessages.ONLY_ADMIN);

    }
  }
  /////////////////////////// Fonction pour On verifie si le User existe/////////////////////////////////////////////
  async verifyUsersExistence(userId: number) {
    // On verifie si l'utilisateur existe
    const user = await this.prismaService.users.findUnique({
      where: { userId: userId },
      include: {
        role: true, // Inclure les informations du rôle
        jobApplications: true, // Inclure les candidatures à des emplois
        jobListings: true, // Inclure les annonces d'emploi créées par l'utilisateur
        savedJobs: true, // Inclure les emplois sauvegardés par l'utilisateur
        consultantAppointments: true, // Inclure ses RDV si c'est un Consultant
        jobTitle: true, // Inclure le titre de l'emploi de l'utilisateur
      },
    });

    if (!user) 
    throw new NotFoundException(ErrorMessages.NO_USER_FOUND);
    return user;
  }
  ///////////////////////////// Fonction pour On verifie si le sexe est soit 'F' soit 'M'///////////////////////////
  async verifyUserSex(sex: string): Promise<void> {
    // On verifie si le sexe est 'F' ou 'M'
    if (sex !== 'M' && sex !== 'F') {
      throw new BadRequestException(ErrorMessages.INVALID_SEX);
    }
  }
  ///////////////////////// Fonction pour On verifie l'âge//////////////////////////////////////////////////////////
  isAgeValid(dateBirth: Date): boolean {
    // Obtenir la date actuelle
    const today = new Date();
    // Calculer l'âge
    const age = differenceInYears(today, dateBirth);
    // On verifie si l'âge est d'au moins 18 ans
    return age >= 18;
  }
  /////////////// contrôle du contenu réel du fichier pour s'On assurer qu'il s'agit bien d'un document PDF //////////
  private async isPDF(file: Express.Multer.File): Promise<boolean> {
    // On verifie si le chemin du fichier est défini
    if (!file || !file.path) {
      console.error(`Erreur : chemin du fichier non défini.`);
      return false;
    }
    try {
      const fileBuffer = readFileSync(file.path);
      await PDFDocument.load(fileBuffer);
      return true; // Si le fichier est chargé sans erreur, c'est un PDF valide
    } catch (error) {
      console.error(`Erreur lors de la vérification du fichier PDF :`, error);
      return false; // Une erreur indique que le fichier n'est pas un PDF valide
    }
  }
  ////////////// Methode pour supprimer le CV apres la suppression de l'utilisateur ///////////////////////////////
  private async deleteCvFile(cvPath: string) {
    if (cvPath) {
      // Construction du chemin complet
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const fullPath = path.join(uploadsDir, cvPath);

      console.log('Tentative de suppression du CV :', fullPath);
      try {
        await unlink(fullPath);
        console.log(`CV file at ${fullPath} successfully deleted.`);
        return { message: `CV file at ${fullPath} successfully deleted.` };
      } catch (error) {
        console.error(
          `Failed to delete CV file at ${fullPath}: ${error.message}`,
        );
        return {
          message: `Failed to delete CV file at ${fullPath}: ${error.message}`,
        };
      }
    }
  }

  ///////////// Fonction utilitaire pour supprimer le fichier qui n'a pas son chemin enregistrè dans la BD ////////
  private async deleteFile(filePath: string): Promise<void> {
    if (existsSync(filePath)) {
      try {
        await unlink(filePath);
      } catch (error) {
        console.error(`Erreur lors de la suppression du fichier:`, error);
      }
    } else {
      // Le chemin existe mais le fichier physique n'est pas trouvé
      console.log(`Le lien existe mais ne pointe vers aucun fichier physique.`);
    }
  }
  /////////////// Fonction pour vérifier le rôle
  async verifyRoleExistence(roleId: number) {
    const role = await this.prismaService.roles.findUnique({
      where: { roleId: roleId },
    });
    if (!role) {
      throw new NotFoundException(`Rôle spécifié introuvable.`);
    }
    return role;
  }
  ///////////////// Fonction pour si l'utilisateur est déjà inscrit
  async ckeckEmailUniquess(email: string) {
    const existingUser = await this.prismaService.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException(ErrorMessages.ALREADY_EXIST);
    }
  }
  ///////////////// Fonction pour si l'utilisateur est déjà inscrit
  async verifyEmailExistence(email: string) {
    const user = await this.prismaService.users.findUnique({
      where: { email },
      include: {
        role: true, // Inclure les informations du rôle
        jobApplications: true, // Inclure les candidatures à des emplois
        jobListings: true, // Inclure les annonces d'emploi créées par l'utilisateur
        savedJobs: true, // Inclure les emplois sauvegardés par l'utilisateur
        consultantAppointments: true, // Inclure ses RDV si c'est un Consultant
        jobTitle: true, // Inclure le titre de l'emploi de l'utilisateur
      },
    });
    if (!user)
    throw new NotFoundException(ErrorMessages.EMAIL_NOT_FOUND);

    return user;
  }
  ///////////////// La suppression en Cascade
  async deleteUsersOnCascade(userIdToDelete: number) {
    // On récupère les informations de l'utilisateur à supprimer
    const userToDelete = await this.verifyUsersExistence(userIdToDelete);
    const roleOfUserToDelete = userToDelete.role.title;

    // Début d'une transaction
    await this.prismaService.$transaction(async (prisma) => {
      // On supprime tous les enregistrements liés à l'utilisateurs

      // si le role est Candidat
      if (roleOfUserToDelete === 'Candidate') {
        // On va trouver tous les jobApplicationIds pour cet utilisateur
        const userJobApplications = await prisma.jobApplications.findMany({
          where: { userId: userIdToDelete },
          select: { jobApplicationId: true },
        });

        // On va extraire les jobApplicationIds dans un tableau
        const jobApplicationIds = userJobApplications.map(
          (app) => app.jobApplicationId,
        );

        // On va utiliser les jobApplicationIds pour supprimer les rendez-vous correspondants
        await prisma.appointment.deleteMany({
          where: {
            jobApplicationId: { in: jobApplicationIds },
          },
        });
      }
      // si le role est Consultant
      if (roleOfUserToDelete === 'Consultant') {
        // Après on supprime tous ses RDV (si le role est Consultant)
        await prisma.appointment.deleteMany({
          where: { consultantId: userIdToDelete },
        });
      }
      // si le role est Candidat
      if (roleOfUserToDelete === 'Candidate') {
        // Après on supprime tous ses Candidatures
        await prisma.jobApplications.deleteMany({
          where: { userId: userIdToDelete },
        });
      }
      // si le role est Candidat ou consultant
      if (
        roleOfUserToDelete === 'Candidate' ||
        roleOfUserToDelete === 'Consultant'
      ) {
        // On supprime avant, tous ses emplois sauvés (
        await prisma.saveJobs.deleteMany({ where: { userId: userIdToDelete } });
      }
      // si le role est Recruiter
      if (roleOfUserToDelete === 'Recruiter') {
        // On supprime tous les RDV liés à l'offre d'emploi du recruteur
        await prisma.appointment.deleteMany({
          where: { jobApplication: { jobListing: { userId: userIdToDelete } } },
        });

        // On supprime toutes les candidatures liées à l'offre d'emploi du recruteur
        await prisma.jobApplications.deleteMany({
          where: { jobListing: { userId: userIdToDelete } },
        });

        // On supprime toutes les sauvegardes liées à l'offre d'emploi du recruteur
        await prisma.saveJobs.deleteMany({
          where: { jobListing: { userId: userIdToDelete } },
        });

        // On supprime toutes les offres d'emploi du recruteur
        await prisma.jobListings.deleteMany({
          where: { userId: userIdToDelete },
        });
      }

      // Et enfin on supprime l'utilisateur
      await prisma.users.delete({ where: { userId: userIdToDelete } });
    });
  }

  // Cette méthode vérifie si l'email fourni est valide.
  async isValidEmail(email: string) {
    // On définit une expression régulière pour un format d'email valide.
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // On teste si l'email correspond au format défini par l'expression régulière.
    if (!emailRegex.test(email)) {
      // Si l'email ne correspond pas, on lance une exception pour indiquer que l'email n'est pas valide.
      throw new BadRequestException(ErrorMessages.EMAIL_INVALID);
    }
    // On vérifie également si la longueur de l'email dépasse 100 caractères.
    if (email.length > 100) {
      // Si oui, on lance une autre exception pour indiquer que l'email est trop long.
      throw new BadRequestException(ErrorMessages.EMAIL_TOO_LONG);
    }
  }

  /////////////////// On vérifie si la fonction existe
  async verifyJobTitleExistence(jobTitleId: number) {
    const jobTitle = await this.prismaService.jobTitle.findUnique({
      where: { jobTitleId: jobTitleId },
    });
    if (!jobTitle)
      throw new NotFoundException(ErrorMessages.JOB_TITLE_NOT_FOUND);
    return jobTitle;
  }

  // Cette méthode vérifie si le mot de passe fourni est valide.
  async isValidPassword(password: string) {
    // On définit une expression régulière pour un format de mot de passe valide.
    // Le mot de passe doit contenir au moins une lettre minuscule, une lettre majuscule, un chiffre et être d'au moins 8 caractères de long.
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/;

    // On teste si le mot de passe correspond au format défini par l'expression régulière.
    if (!passwordRegex.test(password)) {
      // Si le mot de passe ne correspond pas, on lance une exception pour indiquer que le mot de passe n'est pas valide.
      // Il doit contenir au moins une lettre majuscule, un caractère spécial, et un chiffre.
      
      throw new NotFoundException(ErrorMessages.INVALID_PASSWORD);
    }
    // On vérifie également si la longueur du mot de passe dépasse 100 caractères.
    if (password.length > 100) {
      // Si oui, on lance une autre exception pour indiquer que le mot de passe est trop long.
      throw new BadRequestException(ErrorMessages.EMAIL_TOO_LONG);
    }
  }

  // Cette méthode vérifie si le numero est au format valide.
  async isValidphoneNumber(phoneNumber: string) {
    // On définit une expression régulière pour un format de numero valide.
    // Numéro de téléphone valide:(+32, +352, +39, +33, +41, +49, +31) suivi d'un espace et de 9 à 11 chiffres
    const phoneNumberRegex = /^\+(32|352|39|33|41|49|31)\s\d{9,11}$/;

    // On teste si le numero correspond au format défini par l'expression régulière.
    if (!phoneNumberRegex.test(phoneNumber)) {
      // Si le numero ne correspond pas, on lance une exception pour indiquer que le numero n'est pas valide.

      throw new BadRequestException(ErrorMessages.INVALID_PHONE_NUMBER);
    }
  }

  // On vérifie les numéros de TVA
  async isValidTvaNumber(tvaNumber: string) {
    // Expression régulière pour la Belgique (BE)
    const beRegex = /^BE\d{10}$/;
    // Expression régulière pour la France (FR)
    const frRegex = /^FR[A-Z]{2}\d{9}$/;
    // Expression régulière pour l'Italie (IT)
    const itRegex = /^IT\d{11}$/;
    // Expression régulière pour le Luxembourg (LU)
    const luRegex = /^LU\d{8}$/;
    // Expression régulière pour les Pays-Bas (NL)
    const nlRegex = /^NL\d{9}B\d{2}$/;
    // Expression régulière pour l'Allemagne (DE)
    const deRegex = /^DE\d{9}$/;
    // Expression régulière pour la Suisse (CHE)
    const cheRegex = /^(CHE|CHE-)?\d{3}\.\d{3}\.\d{3} TVA$/;

    // Tableau des expressions régulières pour chaque pays
    const regexArray = [
      beRegex,
      frRegex,
      itRegex,
      luRegex,
      nlRegex,
      deRegex,
      cheRegex,
    ];

    // Vérifie si le numéro de TVA correspond à l'une des expressions régulières
    for (const regex of regexArray) {
      if (regex.test(tvaNumber)) {
        // Si le numéro correspond à une expression régulière, retourne vrai
        return true;
      }
    }
    // Si aucun des regex n'a correspondu, lance une exception
    throw new BadRequestException( ErrorMessages.INVALID_TVA_NUMBER);
  }
}
