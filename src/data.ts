export const customers = [
  {
    customerId: "CUST-10001",
    fullName: "Sofia Bianchi",
    segment: "Premier",
    status: "ACTIVE",
    email: "sofia.bianchi@example.test",
    phone: "+39 320 555 0101",
    address: "Via Roma 18, Milano",
    riskRating: "LOW",
    kycStatus: "VERIFIED"
  },
  {
    customerId: "CUST-10002",
    fullName: "Luca Conti",
    segment: "Retail",
    status: "ACTIVE",
    email: "luca.conti@example.test",
    phone: "+39 320 555 0102",
    address: "Via Verdi 7, Torino",
    riskRating: "MEDIUM",
    kycStatus: "REVIEW_DUE"
  },
  {
    customerId: "CUST-10003",
    fullName: "Giulia Romano",
    segment: "Private Banking",
    status: "RESTRICTED",
    email: "giulia.romano@example.test",
    phone: "+39 320 555 0103",
    address: "Piazza Dante 4, Roma",
    riskRating: "HIGH",
    kycStatus: "ENHANCED_DUE_DILIGENCE"
  }
] as const;

export const customerTransactions = {
  "CUST-10001": [
    { transactionId: "TXN-50001", bookedAt: "2026-08-04T09:15:00Z", description: "Salary payment", amount: 4850.00, currency: "EUR", direction: "CREDIT", category: "INCOME", status: "BOOKED", accountId: "ACC-20001" },
    { transactionId: "TXN-50002", bookedAt: "2026-08-03T17:42:00Z", description: "Milano Energia", amount: 126.48, currency: "EUR", direction: "DEBIT", category: "UTILITIES", status: "BOOKED", accountId: "ACC-20001" },
    { transactionId: "TXN-50003", bookedAt: "2026-08-02T12:08:00Z", description: "Ristorante Centrale", amount: 84.20, currency: "EUR", direction: "DEBIT", category: "DINING", status: "BOOKED", accountId: "ACC-20001" },
    { transactionId: "TXN-50004", bookedAt: "2026-08-01T08:30:00Z", description: "Mortgage payment", amount: 1842.16, currency: "EUR", direction: "DEBIT", category: "HOUSING", status: "BOOKED", accountId: "ACC-20001" }
  ],
  "CUST-10002": [
    { transactionId: "TXN-50005", bookedAt: "2026-08-05T14:20:00Z", description: "SEPA transfer received", amount: 750.00, currency: "EUR", direction: "CREDIT", category: "TRANSFER", status: "BOOKED", accountId: "ACC-20002" },
    { transactionId: "TXN-50006", bookedAt: "2026-08-04T10:11:00Z", description: "Supermercato Torino", amount: 96.72, currency: "EUR", direction: "DEBIT", category: "GROCERIES", status: "BOOKED", accountId: "ACC-20002" }
  ],
  "CUST-10003": [
    { transactionId: "TXN-50007", bookedAt: "2026-08-01T16:05:00Z", description: "Card payment under review", amount: 2499.00, currency: "EUR", direction: "DEBIT", category: "OTHER", status: "PENDING_REVIEW", accountId: "ACC-20003" }
  ]
} as const;

export const portfolios = {
  "CUST-10001": {
    portfolioId: "PORT-70001",
    currency: "EUR",
    totalValue: 284750.35,
    cash: 32400.15,
    dayChange: 1125.8,
    riskProfile: "BALANCED",
    positions: [
      { symbol: "PING-DEMO-EQ", name: "Global Equity Fund", quantity: 825.4, price: 142.36, value: 117496.94, assetClass: "EQUITY" },
      { symbol: "EU-GOV-27", name: "Euro Government Bond 2027", quantity: 1000, price: 98.42, value: 98420, assetClass: "FIXED_INCOME" },
      { symbol: "GREEN-INFRA", name: "Green Infrastructure Fund", quantity: 420, price: 86.75, value: 36435, assetClass: "ALTERNATIVE" }
    ]
  },
  "CUST-10002": {
    portfolioId: "PORT-70002",
    currency: "EUR",
    totalValue: 42650.2,
    cash: 7650.2,
    dayChange: -215.4,
    riskProfile: "CONSERVATIVE",
    positions: [
      { symbol: "EU-BOND-30", name: "Euro Aggregate Bond Fund", quantity: 350, price: 100, value: 35000, assetClass: "FIXED_INCOME" }
    ]
  }
} as const;

export const products = [
  { productId: "PRD-CURRENT-PLUS", name: "Current Account Plus", category: "CURRENT_ACCOUNT", annualFee: 0, interestRate: 0, eligibility: "Age 18+, EU resident", features: ["Instant payments", "Virtual card", "Spending insights"] },
  { productId: "PRD-SAVER-FLEX", name: "Flex Saver", category: "SAVINGS", annualFee: 0, interestRate: 2.15, eligibility: "Existing current-account customer", features: ["Instant access", "Monthly interest", "No minimum balance"] },
  { productId: "PRD-CARD-PLAT", name: "Platinum Credit Card", category: "CREDIT_CARD", annualFee: 120, interestRate: 17.9, eligibility: "Income and credit assessment required", features: ["Travel insurance", "Airport lounge access", "Purchase protection"] },
  { productId: "PRD-INVEST-START", name: "Invest Starter", category: "INVESTMENT", annualFee: 36, interestRate: null, eligibility: "Suitability assessment required", features: ["Model portfolios", "Fractional investing", "ESG preferences"] }
] as const;

export const mortgages = {
  "CUST-10001": {
    mortgageId: "MORT-90001",
    propertyAddress: "Via Manzoni 22, Milano",
    originalPrincipal: 420000,
    outstandingBalance: 318450.75,
    currency: "EUR",
    rateType: "FIXED",
    annualRate: 2.45,
    monthlyPayment: 1842.16,
    maturityDate: "2044-06-30",
    nextPaymentDate: "2026-09-01",
    status: "CURRENT"
  }
} as const;
