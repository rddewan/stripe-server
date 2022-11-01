import { stripe } from './';

/**
 * Create a Payment Intent with a specific amount
 */
export async function createPaymentIntent(amount: number,currency: string) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: currency,
    automatic_payment_methods: {
      enabled: true,
    },
    //payment_method_types: ['card','promptpay'],
  });

  paymentIntent.status

  return paymentIntent;
}