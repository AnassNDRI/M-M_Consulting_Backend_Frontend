export interface ApiErrorResponse {
  statusCode: number; // un code d'erreur HTTP standard
  message: string | string[]; // un message d'erreur ou un tableau de messages
  error: string; // une description courte de l'erreur
}


