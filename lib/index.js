"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripe = void 0;
const dotenv_1 = require("dotenv");
if (process.env.NODE_ENV !== 'production') {
    (0, dotenv_1.config)();
}
// Stripe setup
const stripe_1 = __importDefault(require("stripe"));
exports.stripe = new stripe_1.default(process.env.STRIPE_SECRET, {
    apiVersion: '2022-08-01',
});
// Start the API with Express
const api_1 = require("./api");
const port = process.env.PORT || 3333;
api_1.app.listen(port, () => console.log(`API available on http://localhost:${port}`));
//# sourceMappingURL=index.js.map