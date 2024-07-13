import { IsBoolean, IsNotEmpty } from 'class-validator';


export class InvalidateToDeleteJobListingDto {

  @IsNotEmpty()
  @IsBoolean()
  invalidatyToDelete: boolean;


}