// DTO utilisé par les autres utilisateurs pour mettre à jour certains champs

import { IsNotEmpty, IsString} from 'class-validator';

export class UpdateCvUploadedDto {
  
  @IsString()
  @IsNotEmpty()
  cvPath: string;

}
