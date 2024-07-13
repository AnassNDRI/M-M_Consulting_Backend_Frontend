import { Type } from "class-transformer";
import { IsOptional, IsNumber } from "class-validator";


export class UpdateSaveJobDto {
  
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
   userId?: number;

}