import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  BillingInterval,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import { PLAN_LAUNCH, PLAN_GROWTH, PLAN_PRO } from "./plans";

export { PLAN_LAUNCH, PLAN_GROWTH, PLAN_PRO };

export const BILLING_CURRENCY = "INR";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  billing: {
    [PLAN_LAUNCH]: {
      lineItems: [{ amount: 8000,  currencyCode: BILLING_CURRENCY, interval: BillingInterval.Every30Days }],
    },
    [PLAN_GROWTH]: {
      lineItems: [{ amount: 16000, currencyCode: BILLING_CURRENCY, interval: BillingInterval.Every30Days }],
    },
    [PLAN_PRO]: {
      lineItems: [{ amount: 45000, currencyCode: BILLING_CURRENCY, interval: BillingInterval.Every30Days }],
    },
  },
  future: { expiringOfflineAccessTokens: true },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
