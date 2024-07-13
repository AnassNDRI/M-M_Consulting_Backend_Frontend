import { DtoInterface } from './dto.interface';
import { ApiErrorResponse } from './interface.error';

export interface ApiResponse extends DtoInterface {
  result: boolean; // vrai si la requête a réussi, faux sinon
  data: DtoInterface | DtoInterface[] | null; // les données retournées par le serveur en cas de succès
  error_code: string | null; // code erreur
  error?: ApiErrorResponse; // les détails de l'erreur en cas d'échec
}
