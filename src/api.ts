import express, { NextFunction, Request, Response } from 'express';
export const app = express();
import bodyParser from 'body-parser'
import { createStripeCheckoutSession } from './checkout';
import { createPaymentIntent } from './payments';
import { handleStripeWebhook } from './webhooks';
import { createCustomer, createSetupIntent, getCustomerByEmail, getCustomerById, listPaymentMethods } from './customers';
import { auth } from './firebase';

// Allows cross origin requests
import cors from 'cors';
import { cancelSubscription, createSubscription, listSubscriptions } from './billing';
app.use(cors({ origin: true }));

// Sets rawBody for webhook handling
app.use(
  bodyParser.json({
    verify: (req, res, buffer) => (req['rawBody'] = buffer),
  })
);

// Decodes the Firebase JSON Web Token
app.use(decodeJWT);


/**
 * Catch async errors when awaiting promises 
 */
function runAsync(callback: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    callback(req, res, next).catch(next);
  };
}


/**
 * Decodes the JSON Web Token sent via the frontend app
 * Makes the currentUser (firebase) data available on the body.
 */
async function decodeJWT(req: Request, res: Response, next: NextFunction) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
    const idToken = req.headers.authorization.split('Bearer ')[1];

    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      req['currentUser'] = decodedToken;
    } catch (err) {
      console.log(err);
    }
  }

  next();
}

/**
 * Throws an error if the currentUser does not exist on the request
 */
function validateUser(req: Request) {
  const user = req['currentUser'];
  if (!user) {
    throw new Error(
      'You must be logged in to make this request. i.e Authorization: Bearer <token>'
    );
  }

  return user;
}


/**
 * Checkouts
 */
app.post(
  '/checkouts/',
  runAsync(async ({ body }: Request, res: Response) => {
    res.send(await createStripeCheckoutSession(body.line_items));
  })
)

/**
 * get customer
 * 
 */

app.get(
  '/customer',
  runAsync(async (req: Request, res: Response) => {
    console.log(req.query.customerId)
    const customerId = req.query.customerId.toString();
    
    res.send(
      await getCustomerById(customerId)
    );
  })
);

/**
 * Payment Intents
 */

app.post(
  '/customer',
  runAsync(async (req: Request, res: Response) => {
    console.log(req.body.name)
    
    res.send(
      await createCustomer(
        req.body.name,
        req.body.email,
        req.body.params

      )
    );
  })
);


/**
 * Payment Intents
 */

app.post(
  '/payments',
  runAsync(async ({ body }: Request, res: Response) => {
    
    res.send(
      await createPaymentIntent(body.amount,body.currency)
    );
  })
);

/**
 * Get customer by id
 */

app.get(
  '/customer',
  runAsync(async (req: Request, res: Response) => {
    
    res.send(
      await getCustomerById(req['customerId'])
    );
  })
);

/**
 * Get customer by id
 */

app.get(
  '/customer/search',
  runAsync(async (req: Request, res: Response) => {
    
    res.send(
      await getCustomerByEmail(req.query.email.toString())
    );
  })
);

/**
 * Customers and Setup Intents
 */

// Save a card on the customer record with a SetupIntent
app.post(
  '/wallet',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    const setupIntent = await createSetupIntent(user.uid);
    res.send(setupIntent);
  })
);

// Retrieve all cards attached to a customer
app.get(
  '/wallet',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);

    const wallet = await listPaymentMethods(user.uid);
    res.send(wallet.data);
  })
);

/**
 * Billing and Recurring Subscriptions
 */

// Create a and charge new Subscription
app.post(
  '/subscriptions/',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    const { plan, payment_method } = req.body;
    const subscription = await createSubscription(user.uid, plan, payment_method);
    res.send(subscription);
  })
);

// Get all subscriptions for a customer
app.get(
  '/subscriptions/',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);

    const subscriptions = await listSubscriptions(user.uid);

    res.send(subscriptions.data);
  })
);

// Unsubscribe or cancel a subscription
app.patch(
  '/subscriptions/:id',
  runAsync(async (req: Request, res: Response) => {
    const user = validateUser(req);
    res.send(await cancelSubscription(user.uid, req.params.id));
  })
);



/**
 * Webhooks
 */

// Handle webhooks
app.post('/hooks', runAsync(handleStripeWebhook));
