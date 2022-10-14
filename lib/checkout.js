"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStripeCheckoutSession = void 0;
const _1 = require("./");
/**
 * Creates a Stripe Checkout session with line items
 *  Example Item
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
 */
async function createStripeCheckoutSession(line_items) {
    const url = 'http://localhost:3000'; //process.env.WEBAPP_URL;
    const session = await _1.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${url}/failed`,
    });
    return session;
}
exports.createStripeCheckoutSession = createStripeCheckoutSession;
//# sourceMappingURL=checkout.js.map