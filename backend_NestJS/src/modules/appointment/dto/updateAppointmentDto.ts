import { Type } from "class-transformer";
import { IsInt, IsOptional, IsDate } from "class-validator";

export class UpdateAppointmentDto {

    @IsOptional()
    @IsInt()
    @Type(() => Number) 
    readonly jobApplicationId: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number) 
    readonly timeSlotId: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    readonly appointmentDate: Date;
 
}