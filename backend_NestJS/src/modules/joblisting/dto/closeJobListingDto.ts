import { IsNotEmpty, IsBoolean } from "class-validator";

export class CloseJobListingDto {

  @IsNotEmpty()
  @IsBoolean()
  jobClose: boolean;

}