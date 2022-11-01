"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.createCustomer = exports.getCustomerById = exports.getOrCreateCustomer = exports.listPaymentMethods = exports.createSetupIntent = void 0;
const _1 = require(".");
const firebase_1 = require("./firebase");
/**
 * Creates a SetupIntent used to save a credit card for later use
 */
async function createSetupIntent(userId) {
    const customer = await getOrCreateCustomer(userId);
    return _1.stripe.setupIntents.create({
        customer: customer.id,
    });
}
exports.createSetupIntent = createSetupIntent;
/**
 * Returns all payment sources associated to the user
 */
async function listPaymentMethods(userId) {
    const customer = await getOrCreateCustomer(userId);
    return _1.stripe.paymentMethods.list({
        customer: customer.id,
        type: 'card',
    });
}
exports.listPaymentMethods = listPaymentMethods;
/**
 * Gets the existing Stripe customer or creates a new record
 */
async function getOrCreateCustomer(userId, params) {
    const user = await firebase_1.auth.getUser(userId);
    const userSnapshot = await firebase_1.db.collection('users').doc(userId).get();
    const { stripeCustomerId } = userSnapshot.data() || {};
    console.log(stripeCustomerId);
    // If missing customerID, create it
    if (!stripeCustomerId) {
        // CREATE new customer
        const customer = await _1.stripe.customers.create(Object.assign({ name: user.displayName, email: user.email, metadata: {
                firebaseUID: userId
            } }, params));
        await userSnapshot.ref.create({ stripeCustomerId: customer.id });
        return customer;
    }
    else {
        return await _1.stripe.customers.retrieve(stripeCustomerId);
    }
}
exports.getOrCreateCustomer = getOrCreateCustomer;
/**
* Gets the existing Stripe customer or creates a new record
*/
async function getCustomerById(customerId) {
    return await _1.stripe.customers.retrieve(customerId);
}
exports.getCustomerById = getCustomerById;
/**
 * Creates a new record
 */
async function createCustomer(name, email, params) {
    // CREATE new customer
    const customer = await _1.stripe.customers.create(Object.assign({ name: name, email: email }, params));
    return customer;
}
exports.createCustomer = createCustomer;
/**
 * Creates a new record
 */
async function deleteCustomer(id) {
    // delete new customer
    const customer = await _1.stripe.customers.del(id);
    return customer;
}
exports.deleteCustomer = deleteCustomer;
//# sourceMappingURL=customers.js.map