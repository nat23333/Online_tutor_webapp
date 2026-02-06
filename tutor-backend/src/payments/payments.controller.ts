import { Controller, Post, Body, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
    constructor(private paymentsService: PaymentsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('initiate')
    async initiate(@Req() req, @Body() dto: InitiatePaymentDto) {
        const userId = req.user.sub;
        return this.paymentsService.initiatePayment(userId, dto);
    }

    // Webhook usually called by the payment provider (e.g., Chapa)
    @Post('webhook')
    async webhook(@Body() dto: PaymentWebhookDto) {
        return this.paymentsService.verifyPayment(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('upload-proof')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/proofs',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    async uploadProof(@UploadedFile() file: Express.Multer.File, @Body('paymentId') paymentId: string) {
        return this.paymentsService.handleManualProof(paymentId, file.path);
    }
}
