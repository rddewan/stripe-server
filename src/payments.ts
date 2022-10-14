import { stripe } from './';

/**
 * Create a Payment Intent with a specific amount
 */
export async function createPaymentIntent(amount: number) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    // receipt_email: 'hello@fireship.io',
  });

  paymentIntent.status

  return paymentIntent;
}