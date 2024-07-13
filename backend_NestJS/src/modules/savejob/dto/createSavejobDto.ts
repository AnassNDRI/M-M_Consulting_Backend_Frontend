import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";


export class CreateSavejobDto {
    
    @IsNotEmpty()
    @IsNumber()
    @Type(()=> Number)
    readonly jobListingId: number;

}