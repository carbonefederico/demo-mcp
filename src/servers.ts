import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { customerTransactions, customers, mortgages, portfolios, products } from "./data.js";
import { demoWriteResult, error, ok } from "./helpers.js";

const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const simulatedWrite = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };
const highRiskWrite = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false };

function server(name: string, description: string): McpServer {
  return new McpServer({ name, version: "1.0.0", description });
}

export function buildCustomerServer(): McpServer {
  const mcp = server("bank-customer-mcp", "Static customer profile and demo customer-maintenance operations.");

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
  const mcp = server("bank-portfolio-mcp", "Static investment portfolio information and simulated dealing operations.");

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
  const mcp = server("bank-products-mcp", "Static banking product catalogue, comparison and demo application requests.");

  mcp.registerTool("list_products", {
    description: "List banking products, optionally filtered by category.",
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
  const mcp = server("bank-mortgage-mcp", "Static mortgage servicing, affordability, quotation and demo change requests.");

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
