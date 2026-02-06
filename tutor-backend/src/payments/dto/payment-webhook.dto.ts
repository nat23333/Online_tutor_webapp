import { IsString, IsOptional } from 'class-validator';

export class PaymentWebhookDto {
    @IsString()
    transactionId: string;

    @IsString()
    status: string; // 'success', 'failed', etc.

    @IsOptional()
    @IsString()
    metadata?: string; // JSON string or identifier
}
