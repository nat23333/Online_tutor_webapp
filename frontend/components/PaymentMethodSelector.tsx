'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MessageCircle } from 'lucide-react';

interface PaymentMethodSelectorProps {
  orderId: string;
  amount: number;
  onPaymentMethodSelected?: (method: string, orderId: string) => void;
}

export function PaymentMethodSelector({
  orderId,
  amount,
  onPaymentMethodSelected,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedMethod) return;

    setLoading(true);
    try {
      // Initiate payment in backend
      const response = await api.post('/payments/initiate', {
        bookingId: orderId, // orderId here is actually bookingId passed from previous step
        amount: amount,
        provider: selectedMethod.toUpperCase(),
      });

      const { paymentId } = response.data;

      // Proceed to upload proof
      onPaymentMethodSelected?.(selectedMethod, paymentId);
    } catch (error) {
      console.error("Payment initiation failed", error);
      alert("Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Choose Payment Method</CardTitle>
        <CardDescription>Order ID: {orderId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-accent p-3 rounded-lg">
          <p className="text-sm font-medium">Total Amount to Pay:</p>
          <p className="text-2xl font-bold text-primary">{(amount || 0).toFixed(2)} ETB</p>
        </div>

        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
              <RadioGroupItem value="telebirr" id="telebirr" />
              <Label htmlFor="telebirr" className="flex-1 cursor-pointer font-medium">
                <div className="font-semibold">Telebirr</div>
                <div className="text-xs text-muted-foreground">Fast mobile money transfer</div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
              <RadioGroupItem value="cbe_mobile_banking" id="cbe_mobile" />
              <Label htmlFor="cbe_mobile" className="flex-1 cursor-pointer font-medium">
                <div className="font-semibold">CBE Mobile Banking</div>
                <div className="text-xs text-muted-foreground">Commercial Bank of Ethiopia</div>
              </Label>
            </div>
          </div>
        </RadioGroup>

        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            After selecting a payment method, you will receive detailed payment instructions via Telegram to complete the transaction securely.
          </p>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selectedMethod || loading}
          className="w-full gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          {loading ? 'Processing...' : 'Continue on Telegram'}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          A Telegram message with payment details will be sent to your account
        </p>
      </CardContent>
    </Card>
  );
}
