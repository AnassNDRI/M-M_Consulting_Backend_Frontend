import { Type } from "class-transformer";
import { IsNotEmpty, IsInt, IsDate } from "class-validator";

export class CreateAppointmentDto {

    @IsNotEmpty()
    @IsInt()
    @Type(() => Number) 
    readonly jobApplicationId: number;

    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    readonly appointmentDate: Date;

    @IsNotEmpty()
    @IsInt()
    @Type(() => Number) 
    readonly timeSlotId: number;

}