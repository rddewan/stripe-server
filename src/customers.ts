import { stripe } from '.';
import { db, auth } from './firebase';
import Stripe from 'stripe';

/**
 * Creates a SetupIntent used to save a credit card for later use
 */
export async function createSetupIntent(userId: string) {

    const customer = await getOrCreateCustomer(userId);

    return stripe.setupIntents.create({ 
        customer: customer.id,
    })
}

/**
 * Returns all payment sources associated to the user
 */
export async function listPaymentMethods(userId: string) {
    const customer = await getOrCreateCustomer(userId);

    return stripe.paymentMethods.list({
        customer: customer.id,
        type: 'card',
    });
}


/**
 * Gets the existing Stripe customer or creates a new record
 */
export async function getOrCreateCustomer(userId: string, params?: Stripe.CustomerCreateParams) {
    const user = await auth.getUser(userId);   
    const userSnapshot = await db.collection('users').doc(userId).get();
    const { stripeCustomerId } = userSnapshot.data()|| {};
    console.log(stripeCustomerId);
    
    // If missing customerID, create it
    if (!stripeCustomerId) {          
        // CREATE new customer
        const customer = await stripe.customers.create({
            name:user.displayName,
            email:user.email,
            metadata: {
                firebaseUID: userId
            },
            ...params
        });
        
        await userSnapshot.ref.create({ stripeCustomerId: customer.id });
        return customer;
        
    } else {
       
        return await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
    }
  
}

  /**
 * Gets the existing Stripe customer or creates a new record
 */
export async function getCustomerById(customerId: string) {
    return await stripe.customers.retrieve(customerId) as Stripe.Customer;
}

/**
 * Gets the existing Stripe customer or creates a new record
 */
export async function createCustomer(
    name: string, 
    email: string, 
    params?: Stripe.CustomerCreateParams) {
    
    // CREATE new customer
    const customer = await stripe.customers.create({
        name:name,
        email:email,            
        ...params
    });
    
    return customer;
  
}
