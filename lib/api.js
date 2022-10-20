"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
exports.app = (0, express_1.default)();
const body_parser_1 = __importDefault(require("body-parser"));
const checkout_1 = require("./checkout");
const payments_1 = require("./payments");
const webhooks_1 = require("./webhooks");
const customers_1 = require("./customers");
const firebase_1 = require("./firebase");
// Allows cross origin requests
const cors_1 = __importDefault(require("cors"));
const billing_1 = require("./billing");
exports.app.use((0, cors_1.default)({ origin: true }));
// Sets rawBody for webhook handling
exports.app.use(body_parser_1.default.json({
    verify: (req, res, buffer) => (req['rawBody'] = buffer),
}));
// Decodes the Firebase JSON Web Token
exports.app.use(decodeJWT);
/**
 * Catch async errors when awaiting promises
 */
function runAsync(callback) {
    return (req, res, next) => {
        callback(req, res, next).catch(next);
    };
}
/**
 * Decodes the JSON Web Token sent via the frontend app
 * Makes the currentUser (firebase) data available on the body.
 */
async function decodeJWT(req, res, next) {
    var _a, _b;
    if ((_b = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization) === null || _b === void 0 ? void 0 : _b.startsWith('Bearer ')) {
        const idToken = req.headers.authorization.split('Bearer ')[1];
        try {
            const decodedToken = await firebase_1.auth.verifyIdToken(idToken);
            req['currentUser'] = decodedToken;
        }
        catch (err) {
            console.log(err);
        }
    }
    next();
}
/**
 * Throws an error if the currentUser does not exist on the request
 */
function validateUser(req) {
    const user = req['currentUser'];
    if (!user) {
        throw new Error('You must be logged in to make this request. i.e Authorization: Bearer <token>');
    }
    return user;
}
/**
 * Checkouts
 */
exports.app.post('/checkouts/', runAsync(async ({ body }, res) => {
    res.send(await (0, checkout_1.createStripeCheckoutSession)(body.line_items));
}));
/**
 * Payment Intents
 */
exports.app.post('/payments', runAsync(async ({ body }, res) => {
    res.send(await (0, payments_1.createPaymentIntent)(body.amount));
}));
/**
 * Customers and Setup Intents
 */
// Save a card on the customer record with a SetupIntent
exports.app.post('/wallet', runAsync(async (req, res) => {
    const user = validateUser(req);
    const setupIntent = await (0, customers_1.createSetupIntent)(user.uid);
    res.send(setupIntent);
}));
// Retrieve all cards attached to a customer
exports.app.get('/wallet', runAsync(async (req, res) => {
    const user = validateUser(req);
    const wallet = await (0, customers_1.listPaymentMethods)(user.uid);
    res.send(wallet.data);
}));
/**
 * Billing and Recurring Subscriptions
 */
// Create a and charge new Subscription
exports.app.post('/subscriptions/', runAsync(async (req, res) => {
    const user = validateUser(req);
    const { plan, payment_method } = req.body;
    const subscription = await (0, billing_1.createSubscription)(user.uid, plan, payment_method);
    res.send(subscription);
}));
// Get all subscriptions for a customer
exports.app.get('/subscriptions/', runAsync(async (req, res) => {
    const user = validateUser(req);
    const subscriptions = await (0, billing_1.listSubscriptions)(user.uid);
    res.send(subscriptions.data);
}));
// Unsubscribe or cancel a subscription
exports.app.patch('/subscriptions/:id', runAsync(async (req, res) => {
    const user = validateUser(req);
    res.send(await (0, billing_1.cancelSubscription)(user.uid, req.params.id));
}));
/**
 * Webhooks
 */
// Handle webhooks
exports.app.post('/hooks', runAsync(webhooks_1.handleStripeWebhook));
//# sourceMappingURL=api.js.map