import { stripe } from './';
import Stripe from 'stripe';

/**
 * Creates a Stripe Checkout session with line items
 *  Example OLD Item // deprecated
 {
    "line_items": [
        {
            "name": "T-shirt",
            "description": "Comfortable cotton t-shirt",
            "images": ["https://retailminded.com/wp-content/uploads/2016/03/EN_GreenOlive-1.jpg",],
            "amount": 500,
            "currency": "usd",
            "quantity": 1
        }
    ]
}
 // New 
{
    "line_items": [
        {                  
            
          "price_data": {
              "currency": "thb",
              "unit_amount": 2000,
              "product_data": {
                  "name": "T-shirt",
                  "description": "Comfortable cotton t-shirt",
                  "images": ["https://retailminded.com/wp-content/uploads/2016/03/EN_GreenOlive-1.jpg","https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/MX472_AV4?wid=2000&hei=2000&fmt=jpeg&qlt=95&.v=1570119352353"]
              }
          },
          "quantity": 1
        },       
    ]
}
 */
export async function createStripeCheckoutSession(
  line_items: Stripe.Checkout.SessionCreateParams.LineItem[]
) {

  //const url = 'http://localhost:3000'; //process.env.WEBAPP_URL;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card','promptpay'],
    line_items,
    mode: 'payment',
    success_url: 'https://checkout.stripe.dev/success?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'https://checkout.stripe.dev/failed',
  });

  return session;
}