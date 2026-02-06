import { IsString, IsInt, Min } from 'class-validator';

export class InitiatePaymentDto {
    @IsString()
    bookingId: string;

    @IsInt()
    @Min(1)
    amount: number;

    @IsString()
    provider: string;
}
