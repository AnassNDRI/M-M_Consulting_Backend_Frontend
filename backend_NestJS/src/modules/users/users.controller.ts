import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  ParseIntPipe,
  Post,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import {
  Body,
  Delete,
  Param,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { AdminGuard } from '../security/Guards/adminGuard';
import { ConsultantGuard } from '../security/Guards/consultantGuard';
import { ResetPasswordConfirmationDto } from './dto/resetPasswordConfirmationDto';
import { ResetPasswordDemandDto } from './dto/resetPasswordDemandDto';
import { SigninDto } from './dto/signinDto';
import { SignupAdminConsultantDto } from './dto/signupAdminConsultantDto';
import { SignupCandidateDto } from './dto/signupCandidateDto';
import { SignupRecruiterDto } from './dto/signupRecruiterDto';
import { UsersService } from './users.service';

import { UpdateNotificationDto } from './dto/updateNotificationDto';
import { ValidateUsersDto } from './dto/validateUsersDto';

import { GetUserId } from 'src/common/decorators/get-user-id.decorator';
import { CandidatGuard } from '../security/Guards/candidateGuard';
import { RecruiterGuard } from '../security/Guards/recruiterGuard';
import { UpdateProfileEmplyee } from './dto/UpdateProfileAdminDto';
import { UpdateProfileCandidateDto } from './dto/UpdateProfileCandidate';
import { UpdateProfileRecruiterDto } from './dto/UpdateProfileRecruiterDto';
import { UpdateEmplyeeByAdminDto } from './dto/updateEmplyeeByAdminDto';
import { UpdateUserByConsultantDto } from './dto/updateUserByConsultantDto';
import { ErrorMessages } from 'src/shared/error-management/errors-message';

@Controller('api/users')
//@UseInterceptors(LoggingInterceptor)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   CREATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Create User By Admin @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('register-by-admin')
  signupAdminConsultant(
    @Body() signupAdminConsultantDto: SignupAdminConsultantDto,
    @GetUserId() requestingUserId: number,
  ) {
    // On appelle la méthode signup avec l'ID de l'utilisateur effectuant la requête
    return this.userService.signupAdminConsultant(
      signupAdminConsultantDto,
      requestingUserId,
    );
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Create User Candidate @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Post('register-candidate')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: function (req, file, cb) {
          // Utilisez process.cwd() pour obtenir le chemin du répertoire de travail actuel
          const uploadsDir = path.join(process.cwd(), 'uploads');
          console.log('Saving files to:', uploadsDir);
          cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = path.extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  signupCandidate(
    @UploadedFile() cvFile: Express.Multer.File,
    @Body() signupCandidateDto: SignupCandidateDto,
  ) {
    return this.userService.signupCandidate(signupCandidateDto, cvFile);
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Create User Candidat @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Post('register-recruiter')
  signupRecruiter(@Body() signupRecruiterDto: SignupRecruiterDto) {
    return this.userService.signupRecruiter(signupRecruiterDto);
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Login @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Post('signin')
  signin(@Body() signinDto: SigninDto) {
    return this.userService.signin(signinDto);
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Logout @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@GetUserId() userId: number) {
    return this.userService.logout(userId);
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Reset Password @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Post('reset-password')
  resetPasswordDemand(@Body() resetPasswordDemandDto: ResetPasswordDemandDto) {
    return this.userService.resetPasswordDemand(resetPasswordDemandDto);
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Reset Password Confirmation@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Post('reset-password-confirmation')
  resetPasswordConfirmation(
    @Body() resetPasswordConfirmationDto: ResetPasswordConfirmationDto,
  ) {
    console.log(resetPasswordConfirmationDto); // Imprimer les données reçues
    return this.userService.resetPasswordConfirmation(
      resetPasswordConfirmationDto,
    );
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  refreshToken @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // Définissez l'endpoint pour le rafraîchissement du token ici
  @Post('refreshToken')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    const newToken = await this.userService.refreshToken(refreshToken);
    if (!newToken) {
      throw new UnauthorizedException('Could not refresh token');
    }
    return newToken;
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   READ  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Users List with email confirmed and actif @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('all-users')
  async getAllUsers() {
    return this.userService.getAllUsersWithEmailVerifed();
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Users List with email confirmed and actif @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('all-active-users')
  async getAllActiveUsers() {
    return this.userService.getAllUsersWithEmailVerifedAndActif();
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Users List with email confirmed but inactif @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //@UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('all-inactive-users')
  async getAllInactiveUsers() {
    return this.userService.getAllUsersWithEmailVerifedAndInactif();
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Confirmation de l'adresse mail @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('confirm-email')
  async confirmEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      const apiResponse = await this.userService.confirmUserEmail(token);

      // Vérification du résultat de la confirmation de l'email
      if (apiResponse.result) {
        // Si la confirmation est réussie, redirigez vers la page avec un message de succès
        res.redirect(
          `http://localhost:4200/account-confirm?status=success&message=${encodeURIComponent(apiResponse.data)}`,
        );
      } else {
        // Si apiResponse.result est false, cela signifie que la méthode a traité une certaine logique pour renvoyer false.
        // Dans ce cas, redirigez vers une page d'erreur avec un message approprié (s'il y a lieu)
        res.redirect(
          `http://localhost:4200/account-confirm?status=failure&message}`,
        );
      }
    } catch (error) {
      // Gestion des exceptions spécifiques lancées par confirmUserEmail
      let errorMessageKey = ErrorMessages.EMAIL_CONFIRMATION_INVALID;

      if (error instanceof NotFoundException) {
        errorMessageKey = ErrorMessages.EMAIL_CONFIRMATION_INVALID;
      } else if (error instanceof BadRequestException) {
        errorMessageKey = ErrorMessages.EMAIL_CONFIRMATION_INVALID;
      }
      // Redirection vers la page Angular avec le message d'erreur
      res.redirect(
        `http://localhost:4200/account-confirm?status=failure&message=${encodeURIComponent(errorMessageKey)}`,
      );
    }
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ User Profile Details @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // Typage du paramètre de requête pour assurer la conformité avec l'interface User
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@GetUserId() userId: number) {
    return this.userService.getUserProfile(userId);
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ User Profile Details @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // Typage du paramètre de requête pour assurer la conformité avec l'interface User
  @UseGuards(AuthGuard('jwt'))
  @Get('user-profile/:userId')
  async getuserProfile(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.getUserProfileByAdmin(userId);
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Get User CV by Admin, Consultant, Recruiter @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'))
  @Get('candidates-cv/:userId') // On ajoute '/cv' pour clarifier l'endpoint
  async getCv(@Param('userId') userId: number) {
    return this.userService.getUserCV(userId);
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Candidat CV @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), CandidatGuard) // On s'assurer que l'utilisateur est authentifié
  @Get('my/cv')
  async getMyCv(@GetUserId() userId: number) {
    return this.userService.getUserCV(userId);
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Get All ACTIVE USERS BY ROLE ID @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('users-active-by-role/:roleId')
  async getAllActiveUsersByRoleId(
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.userService.getAllActiveUsersByRoleId(roleId);
  }

   // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Get The Collaborateurs @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
   @UseGuards(AuthGuard('jwt'), ConsultantGuard)
   @Get('collaborators')
   async getAllCollaborateurs() {
     return this.userService.getAllCollaborateurs();
   }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ (New Accoupt created) Get All INACTIVE USERS BY ROLE ID @@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('users-inactive-by-role/:roleId')
  async getAllInactiveUsersByRoleId(
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.userService.getAllInactiveUsersByRoleId(roleId);
  }

  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Cherche des utilisateurs en fonction d'un mot-clé @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('search')
  async searchUsers(@Query('keyword') keyword: string) {
    return this.userService.searchUsers(keyword);
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   Chercher un comptes invalidé par un mot clé @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('search-users-invalidate')
  async searchUsersInvalidate(@Query('keyword') keyword: string) {
    return this.userService.searchUsersInvalidate(keyword);
  }
  //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Chercher un comptes validé par un mot clé @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  //  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('search-users-validate')
  async searchUsersValidate(@Query('keyword') keyword: string) {
    return this.userService.searchUsersValidate(keyword);
  }

  /*  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ User Details By Admin @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // Ici, la méthode retourne un objet typé avec l'interface Users pointant vers "@prisma/client" au lieu de mon interface personnalisée
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('user-details-by-admin/:userId')
  async userDetailsByAdmin(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Users> {
    return this.userService.userDetailsByAdmin(userId);
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ User Details By Consultant  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('user-details-by-consultant/:userId')
  async userDetailsByConsultant(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Users> {
    return this.userService.userDetailsByConsultant(userId);
  }
*/

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Get User CV by Admin, Consultant, Recruiter @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  /* @UseGuards(AuthGuard('jwt'), AccessCandidateCVGuard)
  @Get('/candidates/:userId')
  async getCv(@Param('userId') userId: number, @Res() response: Response) {
    try {
      await this.userService.getUserCV(userId, response);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }*/

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Employess List @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('emplyees-active-list')
  async getAllEmployees() {
    return this.userService.getAllEmployees();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ inactivated Employees List @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('emplyees-inactivated')
  async getAllEmployeesNotEnable() {
    return this.userService.getAllEmployeesNotEnable();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ inactivated  Employees Account with mail by Employees List @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('employee-mail-unverifed')
  async getAllEmployeesAccountWithMailNotVerifed() {
    return this.userService.getAllEmployeesAccountWithMailNotVerifed();
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ inactivated  Employees Account with mail by Employees List @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('account-confirm-mail-token-expired')
  async getAccountWithConfirmationMailTokenExpired() {
    return this.userService.getAccountWithConfirmationMailTokenExpired();
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ inactivated  Account with mail by users Candidat Recruiter List @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('users-mail-unverified')
  async getAllRecruiterCandidateAccountWithMailNotVerifed() {
    return this.userService.getAllRecruiterCandidateAccountWithMailNotVerifed();
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ inactivated  Users List @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('users-inactivated')
  async getAllUsersNotEnable() {
    return this.userService.getAllUsersNotActivated();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ All Administrators @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('administrators')
  async getAllUsersAdministrators() {
    return this.userService.getAllUsersAdministrators();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ All Consultants @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('consultants')
  async getAllUsersConsultants() {
    return this.userService.getAllUsersConsultants();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ All Recruiters @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('recruiters')
  async getAllUsersRecruiters() {
    return this.userService.getAllUsersRecruiters();
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ All Candidats @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Get('candidates')
  async getAllUsersCandidates() {
    return this.userService.getAllUsersCandidates();
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ All Recruiters @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @Get('company')
  async getAllCompany() {
    return this.userService.getAllCompany();
  }

  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   UPDATE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Update Notification @@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'))
  @Put('update-notification')
  updateEmailNotification(
    @GetUserId() requestingUserId: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.userService.updateEmailNotification(
      requestingUserId,
      updateNotificationDto,
    );
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   Update Profile Candidat @@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), CandidatGuard)
  @Put('update-profile-candidate')
  updateProfileCandidate(
    @GetUserId() userId: number,
    @Body() updateProfileCandidateDto: UpdateProfileCandidateDto,
  ) {
    return this.userService.updateProfileCandidate(
      userId,
      updateProfileCandidateDto,
    );
  }


  
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   Update Interview note @@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Put('update-interview-note/:userId')
  updateCandidateInterviewNote(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateProfileCandidateDto: UpdateProfileCandidateDto,
  ) {
    return this.userService.updateCandidateInterviewNote(
      userId,
      updateProfileCandidateDto,
    );
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   Update Profile Recruiter @@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), RecruiterGuard)
  @Put('update-profile-recruiter')
  updateProfileRecruiter(
    @GetUserId() requestingUserId: number,
    @Body() updateProfileRecruiterDto: UpdateProfileRecruiterDto,
  ) {
    return this.userService.updateProfileRecruiter(
      requestingUserId,
      updateProfileRecruiterDto,
    );
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   Update Profile Admin @@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Put('update-profile-employee')
  updateProfileEmployee(
    @GetUserId() requestingUserId: number,
    @Body() updateProfileAdminDto: UpdateProfileEmplyee,
  ) {
    return this.userService.updateProfileEmployee(
      requestingUserId,
      updateProfileAdminDto,
    );
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Upadate User By Consultant @@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Put('update-user-by-admin/:userId')
  async updateUserByConsultant(
    @Param('userId', ParseIntPipe) userIdToUpdate: number,
    @GetUserId() requestingUserId: number,
    @Body() updateUserByConsultantDto: UpdateUserByConsultantDto,
  ) {
    return this.userService.updateUserByConsultant(
      userIdToUpdate,
      requestingUserId,
      updateUserByConsultantDto,
    );
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Upadate Employees By Admin @@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Put('update-admin/:userId')
  async updateEmplyeeByAdminDto(
    @Param('userId', ParseIntPipe) userIdToUpdate: number,
    @GetUserId() requestingUserId: number,
    @Body() updateEmplyeeByAdminDto: UpdateEmplyeeByAdminDto,
  ) {
    return this.userService.updateEmplyeeByAdminDto(
      userIdToUpdate,
      requestingUserId,
      updateEmplyeeByAdminDto,
    );
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Update User CV @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), CandidatGuard)
  @Put('update-cv')
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: function (req, file, cb) {
          // Utilisez process.cwd() pour obtenir le chemin du répertoire de travail actuel
          const uploadsDir = path.join(process.cwd(), 'uploads');
          console.log('Saving files to:', uploadsDir);
          cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = path.extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async updateCvUploaded(
    @GetUserId() requestingUserId: number,
    @UploadedFile() cv: Express.Multer.File,
  ) {
    if (!cv) {
      throw new BadRequestException('Aucun fichier CV fourni.');
    }
    return this.userService.updateCvUploaded(requestingUserId, cv);
  }

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Validate Users after Signup @@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Put('validate/:userId')
  validateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @GetUserId() requestingUserId: number,
    @Body() validateUsersDto: ValidateUsersDto,
  ) {
    return this.userService.validateUser(
      userId,
      requestingUserId,
      validateUsersDto,
    );
  }



  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$   DELETE  $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
  //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete User By Admin @@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard)
  @Delete('delete-account/:userId')
  async deleteUserByAdmin(
    @Param('userId', ParseIntPipe) userIdToDelete: number,
    @GetUserId() requestingUserId: number,
  ) {
    return this.userService.deleteUserByAdmin(userIdToDelete, requestingUserId);
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  Delete Profile  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt')) // Cette route est protegée
  @Delete('delete-profile')
  async deleteProfile(@GetUserId() userId: number) {
    return this.userService.deleteProfile(userId);
  }
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Deleting all inactivated accounts with expired confirmationMailTokenExpires @@@@@@@@@@@@@
  @UseGuards(AuthGuard('jwt'), ConsultantGuard) // Cette route est protegée
  @Delete('delete-account-confirm-mail-token-expired')
  async deleteExpiredConfirmationTokens() {
    return this.userService.deleteExpiredConfirmationTokens();
  }
}
