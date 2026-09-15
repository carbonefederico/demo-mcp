import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { applicationConfigs, customerTransactions, customers, errorEvents, identities, mortgages, portfolios, products, serviceHealth, userSessions } from "./data.ts";
import { demoWriteResult, error, ok } from "./helpers.ts";

const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const simulatedWrite = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };
const highRiskWrite = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false };

function server(name: string, description: string): McpServer {
  return new McpServer({ name, version: "1.0.0", description });
}

export function buildCustomerServer(): McpServer {
  const mcp = server("demo-customer-mcp", "Static customer profile and demo customer-maintenance operations.");

  mcp.registerTool("get_customer", {
    description: "Retrieve a single customer's profile, status, KYC status and risk rating.",
    inputSchema: z.object({ customerId: z.string().describe("Example: CUST-10001") }),
    annotations: readOnly
  }, async ({ customerId }) => {
    const customer = customers.find(c => c.customerId === customerId);
    return customer ? ok(customer) : error(`Customer ${customerId} was not found.`);
  });

  mcp.registerTool("search_customers", {
    description: "Search demo customers by name, segment, status or customer ID.",
    inputSchema: z.object({ query: z.string().min(1), limit: z.number().int().min(1).max(10).default(5) }),
    annotations: readOnly
  }, async ({ query, limit }) => {
    const q = query.toLowerCase();
    const matches = customers.filter(c => JSON.stringify(c).toLowerCase().includes(q)).slice(0, limit);
    return ok({ count: matches.length, customers: matches });
  });

  mcp.registerTool("update_customer", {
    description: "HIGH-RISK DEMO WRITE. Validate an update to customer profile data. Requires explicit user confirmation; no data is persisted.",
    inputSchema: z.object({
      customerId: z.string(),
      fullName: z.string().min(3).optional(),
      email: z.email().optional(),
      phone: z.string().min(7).optional(),
      address: z.string().min(5).optional(),
      segment: z.enum(["Retail", "Premier", "Private Banking"]).optional(),
      status: z.enum(["ACTIVE", "RESTRICTED", "CLOSED"]).optional(),
      confirmedByUser: z.literal(true).describe("Must be true only after explicit user confirmation"),
      reason: z.string().min(5)
    }).refine(v => Boolean(v.fullName || v.email || v.phone || v.address || v.segment || v.status), { message: "At least one customer field must be supplied." }),
    annotations: highRiskWrite
  }, async input => {
    if (!customers.some(c => c.customerId === input.customerId)) return error(`Customer ${input.customerId} was not found.`);
    return demoWriteResult("UPDATE_CUSTOMER", input, true);
  });

  mcp.registerTool("get_customer_transactions", {
    description: "Retrieve recent static transactions for a customer, optionally filtered by direction or status.",
    inputSchema: z.object({
      customerId: z.string(),
      direction: z.enum(["CREDIT", "DEBIT"]).optional(),
      status: z.enum(["BOOKED", "PENDING_REVIEW"]).optional(),
      limit: z.number().int().min(1).max(50).default(20)
    }),
    annotations: readOnly
  }, async ({ customerId, direction, status, limit }) => {
    if (!customers.some(c => c.customerId === customerId)) return error(`Customer ${customerId} was not found.`);
    const transactions = customerTransactions[customerId as keyof typeof customerTransactions] ?? [];
    const filtered = transactions
      .filter(t => !direction || t.direction === direction)
      .filter(t => !status || t.status === status)
      .slice(0, limit);
    return ok({ customerId, count: filtered.length, transactions: filtered });
  });

  return mcp;
}

export function buildPortfolioServer(): McpServer {
  const mcp = server("demo-portfolio-mcp", "Static investment portfolio information and simulated dealing operations.");

  mcp.registerTool("get_portfolio_summary", {
    description: "Get portfolio valuation, cash, daily movement and risk profile for a customer.",
    inputSchema: z.object({ customerId: z.string() }), annotations: readOnly
  }, async ({ customerId }) => {
    const portfolio = portfolios[customerId as keyof typeof portfolios];
    return portfolio ? ok({ ...portfolio, positions: undefined }) : error(`No portfolio found for ${customerId}.`);
  });

  mcp.registerTool("list_positions", {
    description: "List all positions in a customer's demo portfolio.",
    inputSchema: z.object({ customerId: z.string() }), annotations: readOnly
  }, async ({ customerId }) => {
    const portfolio = portfolios[customerId as keyof typeof portfolios];
    return portfolio ? ok({ portfolioId: portfolio.portfolioId, positions: portfolio.positions }) : error(`No portfolio found for ${customerId}.`);
  });

  mcp.registerTool("simulate_trade", {
    description: "Calculate a non-binding trade simulation including estimated value and fee. Does not place an order.",
    inputSchema: z.object({ customerId: z.string(), symbol: z.string(), side: z.enum(["BUY", "SELL"]), quantity: z.number().positive() }),
    annotations: readOnly
  }, async input => {
    const referencePrice = 142.36;
    const grossAmount = Number((input.quantity * referencePrice).toFixed(2));
    const estimatedFee = Number(Math.max(4.95, grossAmount * 0.0015).toFixed(2));
    return ok({ ...input, currency: "EUR", referencePrice, grossAmount, estimatedFee, estimatedTotal: Number((grossAmount + (input.side === "BUY" ? estimatedFee : -estimatedFee)).toFixed(2)), binding: false });
  });

  mcp.registerTool("submit_trade_order", {
    description: "HIGH-RISK DEMO WRITE. Submit a trade-order request after explicit confirmation. No order reaches a market and nothing is persisted.",
    inputSchema: z.object({ customerId: z.string(), symbol: z.string(), side: z.enum(["BUY", "SELL"]), quantity: z.number().positive(), orderType: z.enum(["MARKET", "LIMIT"]), limitPrice: z.number().positive().optional(), confirmedByUser: z.literal(true) }),
    annotations: highRiskWrite
  }, async input => demoWriteResult("SUBMIT_TRADE_ORDER", input, true));

  return mcp;
}

export function buildProductsServer(): McpServer {
  const mcp = server("demo-products-mcp", "Static demo product catalogue, comparison and demo application requests.");

  mcp.registerTool("list_products", {
    description: "List demo products, optionally filtered by category.",
    inputSchema: z.object({ category: z.enum(["CURRENT_ACCOUNT", "SAVINGS", "CREDIT_CARD", "INVESTMENT"]).optional() }), annotations: readOnly
  }, async ({ category }) => ok({ products: category ? products.filter(p => p.category === category) : products }));

  mcp.registerTool("get_product_details", {
    description: "Get full details for a product.",
    inputSchema: z.object({ productId: z.string() }), annotations: readOnly
  }, async ({ productId }) => {
    const product = products.find(p => p.productId === productId);
    return product ? ok(product) : error(`Product ${productId} was not found.`);
  });

  mcp.registerTool("compare_products", {
    description: "Compare two or more products side by side.",
    inputSchema: z.object({ productIds: z.array(z.string()).min(2).max(4) }), annotations: readOnly
  }, async ({ productIds }) => {
    const selected = products.filter(p => productIds.includes(p.productId));
    return ok({ requested: productIds.length, found: selected.length, products: selected });
  });

  mcp.registerTool("request_product_application", {
    description: "HIGH-RISK DEMO WRITE. Create a non-persistent product application request after explicit confirmation.",
    inputSchema: z.object({ customerId: z.string(), productId: z.string(), confirmedByUser: z.literal(true), channel: z.enum(["WEB", "MOBILE", "BRANCH", "CONTACT_CENTRE"]) }), annotations: simulatedWrite
  }, async input => {
    if (!products.some(p => p.productId === input.productId)) return error(`Product ${input.productId} was not found.`);
    return demoWriteResult("REQUEST_PRODUCT_APPLICATION", input, true);
  });

  return mcp;
}

export function buildMortgageServer(): McpServer {
  const mcp = server("demo-mortgage-mcp", "Static mortgage servicing, affordability, quotation and demo change requests.");

  mcp.registerTool("get_mortgage_summary", {
    description: "Retrieve the current mortgage summary for a customer.",
    inputSchema: z.object({ customerId: z.string() }), annotations: readOnly
  }, async ({ customerId }) => {
    const mortgage = mortgages[customerId as keyof typeof mortgages];
    return mortgage ? ok(mortgage) : error(`No mortgage found for ${customerId}.`);
  });

  mcp.registerTool("calculate_affordability", {
    description: "Estimate mortgage affordability using simple demo rules; this is not financial advice or a lending decision.",
    inputSchema: z.object({ annualGrossIncome: z.number().positive(), monthlyDebtPayments: z.number().nonnegative(), deposit: z.number().nonnegative(), termYears: z.number().int().min(5).max(35) }), annotations: readOnly
  }, async input => {
    const incomeMultiple = 4.2;
    const debtAdjustment = input.monthlyDebtPayments * 12 * 5;
    const maxLoan = Math.max(0, input.annualGrossIncome * incomeMultiple - debtAdjustment);
    return ok({ ...input, currency: "EUR", estimatedMaxLoan: Math.round(maxLoan), estimatedMaxPurchasePrice: Math.round(maxLoan + input.deposit), decision: "INDICATIVE_ONLY", assumptions: { incomeMultiple, debtAdjustmentYears: 5 } });
  });

  mcp.registerTool("generate_rate_quote", {
    description: "Generate a non-binding static mortgage rate quote.",
    inputSchema: z.object({ loanAmount: z.number().positive(), propertyValue: z.number().positive(), termYears: z.number().int().min(5).max(35), rateType: z.enum(["FIXED", "VARIABLE"]) }), annotations: readOnly
  }, async input => {
    const ltv = input.loanAmount / input.propertyValue;
    const annualRate = input.rateType === "FIXED" ? (ltv <= 0.6 ? 2.65 : ltv <= 0.8 ? 3.05 : 3.55) : 2.85;
    const monthlyRate = annualRate / 100 / 12;
    const months = input.termYears * 12;
    const monthlyPayment = input.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return ok({ ...input, currency: "EUR", loanToValuePercent: Number((ltv * 100).toFixed(2)), annualRate, estimatedMonthlyPayment: Number(monthlyPayment.toFixed(2)), binding: false, expiresInMinutes: 15 });
  });

  mcp.registerTool("submit_mortgage_change_request", {
    description: "HIGH-RISK DEMO WRITE. Submit a mortgage servicing change request. No account changes occur.",
    inputSchema: z.object({ mortgageId: z.string(), changeType: z.enum(["PAYMENT_DATE", "OVERPAYMENT", "TERM_CHANGE", "RATE_SWITCH"]), requestedValue: z.string().min(1), confirmedByUser: z.literal(true), reason: z.string().min(5) }), annotations: highRiskWrite
  }, async input => demoWriteResult("SUBMIT_MORTGAGE_CHANGE_REQUEST", input, true));

  return mcp;
}

export function buildOpsServer(): McpServer {
  const mcp = server("demo-ops-mcp", "Error, incident and service-health analysis over synthetic operational data.");

  mcp.registerTool("get_service_health", {
    description: "Get health status, error rate, latency and last deploy for a service, or an overview of all services.",
    inputSchema: z.object({ service: z.string().optional().describe("Omit to get an overview of all services") }), annotations: readOnly
  }, async ({ service }) => {
    if (!service) return ok({ services: serviceHealth });
    const health = serviceHealth.find(h => h.service === service);
    return health ? ok(health) : error(`No health data found for ${service}.`, { available: serviceHealth.map(h => h.service) });
  });

  mcp.registerTool("search_errors", {
    description: "Search synthetic error events by service, error code or minimum severity.",
    inputSchema: z.object({
      service: z.string().optional(),
      code: z.string().optional(),
      severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
      limit: z.number().int().min(1).max(20).default(10)
    }), annotations: readOnly
  }, async ({ service, code, severity, limit }) => {
    const rank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const matches = errorEvents
      .filter(e => (!service || e.service === service) && (!code || e.code === code) && (!severity || rank[e.severity] <= rank[severity]))
      .sort((a, b) => rank[a.severity] - rank[b.severity])
      .slice(0, limit);
    return ok({ count: matches.length, errors: matches });
  });

  mcp.registerTool("analyze_error", {
    description: "Deep-dive an error event: occurrence timeline, affected users, correlated deploy and root-cause candidates.",
    inputSchema: z.object({ errorId: z.string().describe("Example: ERR-20001") }), annotations: readOnly
  }, async ({ errorId }) => {
    const event = errorEvents.find(e => e.errorId === errorId);
    if (!event) return error(`Error event ${errorId} was not found.`, { available: errorEvents.map(e => e.errorId) });
    return ok({
      ...event,
      analysis: {
        summary: `${event.service} reported ${event.occurrences} occurrences of ${event.code} affecting ${event.affectedUsers} users since ${event.firstSeenAt}.`,
        correlatedDeploy: event.correlatedDeploy
          ? "First occurrence is within 2 minutes of a deploy: consider a release regression."
          : "No deploy correlates with the first occurrence.",
        recommendedNextSteps: [
          "Check service health for the affected service.",
          "Review recent change requests for the service.",
          "If a release regression is confirmed, schedule a rollback change."
        ]
      }
    });
  });

  return mcp;
}

export function buildIamServer(): McpServer {
  const mcp = server("demo-iam-mcp", "Synthetic identity, session and IdP application-configuration lookups for support demos.");

  mcp.registerTool("get_user_identity", {
    description: "Retrieve an internal user's identity: account status, MFA enrolment, groups and linked customer IDs.",
    inputSchema: z.object({ userId: z.string().optional(), email: z.string().optional() }), annotations: readOnly
  }, async ({ userId, email }) => {
    if (!userId && !email) return error("Provide userId or email.");
    const identity = identities.find(i => (userId && i.userId === userId) || (email && i.email.toLowerCase() === email.toLowerCase()));
    return identity ? ok(identity) : error("Identity was not found.", { userId, email });
  });

  mcp.registerTool("list_user_sessions", {
    description: "List active synthetic sessions for a user, including device, IP, location and risk flags.",
    inputSchema: z.object({ userId: z.string() }), annotations: readOnly
  }, async ({ userId }) => {
    if (!identities.some(i => i.userId === userId)) return error(`User ${userId} was not found.`);
    const sessions = userSessions.filter(s => s.userId === userId);
    return ok({ userId, count: sessions.length, sessions });
  });

  mcp.registerTool("get_application_config", {
    description: "Get the synthetic IdP configuration of a registered application: grant types, redirect URIs, scopes and token lifetimes.",
    inputSchema: z.object({ clientId: z.string().describe("Example: mobile-app") }), annotations: readOnly
  }, async ({ clientId }) => {
    const appConfig = applicationConfigs.find(c => c.clientId === clientId);
    return appConfig ? ok(appConfig) : error(`Application ${clientId} was not found.`, { available: applicationConfigs.map(c => c.clientId) });
  });

  mcp.registerTool("unlock_account", {
    description: "HIGH-RISK DEMO WRITE. Unlock a user account or reset its credentials after explicit confirmation. No IdP is changed.",
    inputSchema: z.object({
      userId: z.string(),
      action: z.enum(["UNLOCK", "RESET_MFA"]),
      confirmedByUser: z.literal(true).describe("Must be true only after explicit user confirmation"),
      reason: z.string().min(5)
    }), annotations: highRiskWrite
  }, async input => {
    if (!identities.some(i => i.userId === input.userId)) return error(`User ${input.userId} was not found.`);
    return demoWriteResult(`IAM_${input.action}`, input, true);
  });

  return mcp;
}
