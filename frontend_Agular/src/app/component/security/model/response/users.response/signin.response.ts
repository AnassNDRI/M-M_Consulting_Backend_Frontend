import { DtoInterface } from '../../../../../shared/model';
import { CredentialDto, TokenDto } from '../../dto';

export interface SigninResponse extends DtoInterface {
  user: CredentialDto; // Défini comme requis
  token: TokenDto; // Défini comme requis
}
