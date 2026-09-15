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

// ---------------------------------------------------------------------------
// Ops / incident demo data
// ---------------------------------------------------------------------------

export interface ServiceHealth {
  service: string;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  errorRatePercent: number;
  p99LatencyMs: number;
  requestsPerMinute: number;
  openIncidents: string[];
  lastDeployAt: string;
  deployedVersion: string;
}

export const serviceHealth: ServiceHealth[] = [
  { service: "payment-service", status: "DEGRADED", errorRatePercent: 8.4, p99LatencyMs: 2450, requestsPerMinute: 1420, openIncidents: ["INC-1001"], lastDeployAt: "2026-09-15T14:00:00Z", deployedVersion: "v4.12.1" },
  { service: "auth-service", status: "DEGRADED", errorRatePercent: 3.1, p99LatencyMs: 890, requestsPerMinute: 640, openIncidents: ["INC-1001"], lastDeployAt: "2026-09-15T14:00:00Z", deployedVersion: "v2.8.0" },
  { service: "customer-api", status: "HEALTHY", errorRatePercent: 0.2, p99LatencyMs: 140, requestsPerMinute: 380, openIncidents: [], lastDeployAt: "2026-09-10T09:30:00Z", deployedVersion: "v1.9.3" },
  { service: "ledger-service", status: "HEALTHY", errorRatePercent: 0.0, p99LatencyMs: 95, requestsPerMinute: 910, openIncidents: [], lastDeployAt: "2026-09-12T11:15:00Z", deployedVersion: "v3.4.2" }
];

export interface ErrorEvent {
  errorId: string;
  service: string;
  code: string;
  message: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  firstSeenAt: string;
  lastSeenAt: string;
  occurrences: number;
  affectedUsers: number;
  sampleStack: string;
  correlatedDeploy: string | null;
  rootCauseCandidates: string[];
}

export const errorEvents: ErrorEvent[] = [
  {
    errorId: "ERR-20001",
    service: "payment-service",
    code: "PAYMENT_TIMEOUT",
    message: "Upstream ledger call timed out after 2000ms",
    severity: "CRITICAL",
    firstSeenAt: "2026-09-15T14:02:00Z",
    lastSeenAt: "2026-09-15T14:41:00Z",
    occurrences: 1187,
    affectedUsers: 214,
    sampleStack: "at LedgerClient.debit (ledger-client.ts:88)\nat PaymentProcessor.process (processor.ts:214)\nat routes/payments.ts:57",
    correlatedDeploy: "v4.12.1 @ 2026-09-15T14:00:00Z",
    rootCauseCandidates: [
      "v4.12.1 raised ledger timeout budget from 5000ms to 2000ms",
      "ledger-service latency stable; timeout is client-side",
      "Config key payments.ledgerTimeoutMs changed in release"
    ]
  },
  {
    errorId: "ERR-20002",
    service: "auth-service",
    code: "AUTH_SESSION_REJECTED",
    message: "Valid sessions rejected after config deploy: token validation failure",
    severity: "HIGH",
    firstSeenAt: "2026-09-15T14:02:00Z",
    lastSeenAt: "2026-09-15T14:40:00Z",
    occurrences: 342,
    affectedUsers: 96,
    sampleStack: "at SessionValidator.validate (session.ts:41)\nat middleware/auth.ts:19",
    correlatedDeploy: "v2.8.0 @ 2026-09-15T14:00:00Z",
    rootCauseCandidates: [
      "v2.8.0 enabled strict clock-skew validation (max 30s)",
      "Devices with >30s drift fail session validation",
      "Correlates with spike in unlock_account requests"
    ]
  },
  {
    errorId: "ERR-20003",
    service: "payment-service",
    code: "CARD_DECLINED",
    message: "Card authorisation declined: issuer service unavailable",
    severity: "MEDIUM",
    firstSeenAt: "2026-09-15T13:58:00Z",
    lastSeenAt: "2026-09-15T14:39:00Z",
    occurrences: 64,
    affectedUsers: 41,
    sampleStack: "at CardIssuer.authorise (card-issuer.ts:120)\nat PaymentProcessor.process (processor.ts:189)",
    correlatedDeploy: null,
    rootCauseCandidates: [
      "Issuer connectivity intermittent; no deploy correlation",
      "Overlaps with PAYMENT_TIMEOUT incident window"
    ]
  }
];

export const alerts = [
  { alertId: "ALR-30001", service: "payment-service", severity: "CRITICAL", title: "Payment error rate above 5%", triggeredAt: "2026-09-15T14:05:00Z", status: "FIRING" },
  { alertId: "ALR-30002", service: "auth-service", severity: "HIGH", title: "Session rejections spiking", triggeredAt: "2026-09-15T14:06:00Z", status: "FIRING" },
  { alertId: "ALR-30003", service: "customer-api", severity: "LOW", title: "Elevated 404s on /customers/{id}", triggeredAt: "2026-09-14T22:10:00Z", status: "RESOLVED" }
];

// ---------------------------------------------------------------------------
// IAM / IdP demo data
// ---------------------------------------------------------------------------

export interface Identity {
  userId: string;
  fullName: string;
  email: string;
  department: string;
  accountStatus: "ACTIVE" | "LOCKED" | "SUSPENDED";
  mfaEnrolled: boolean;
  mfaMethod: string | null;
  groups: string[];
  lastLoginAt: string | null;
  linkedCustomerIds: string[];
}

export const identities: Identity[] = [
  {
    userId: "EMP-7001",
    fullName: "Sofia Bianchi",
    email: "sofia.bianchi@example.test",
    department: "Retail Banking Ops",
    accountStatus: "LOCKED",
    mfaEnrolled: true,
    mfaMethod: "TOTP",
    groups: ["BankingOps", "CardSupport"],
    lastLoginAt: "2026-09-15T08:55:00Z",
    linkedCustomerIds: ["CUST-10001"]
  },
  {
    userId: "EMP-7002",
    fullName: "Luca Conti",
    email: "luca.conti@example.test",
    department: "IT Support",
    accountStatus: "ACTIVE",
    mfaEnrolled: true,
    mfaMethod: "PASSKEY",
    groups: ["ITSupport", "ServiceDesk"],
    lastLoginAt: "2026-09-15T13:10:00Z",
    linkedCustomerIds: ["CUST-10002"]
  },
  {
    userId: "EMP-7003",
    fullName: "Giulia Romano",
    email: "giulia.romano@example.test",
    department: "IT Support",
    accountStatus: "ACTIVE",
    mfaEnrolled: false,
    mfaMethod: null,
    groups: ["ITSupport"],
    lastLoginAt: "2026-09-15T11:45:00Z",
    linkedCustomerIds: ["CUST-10003"]
  }
] as const;

export interface UserSession {
  sessionId: string;
  userId: string;
  device: string;
  ipAddress: string;
  location: string;
  authenticatedAt: string;
  lastActiveAt: string;
  authMethod: string;
  riskFlags: string[];
}

export const userSessions: UserSession[] = [
  { sessionId: "SES-40001", userId: "EMP-7001", device: "MacBook Pro / Chrome 140", ipAddress: "93.41.102.7", location: "Milano, IT", authenticatedAt: "2026-09-15T08:55:00Z", lastActiveAt: "2026-09-15T14:03:00Z", authMethod: "TOTP", riskFlags: ["NEW_DEVICE"] },
  { sessionId: "SES-40002", userId: "EMP-7002", device: "iPhone 17 / Safari", ipAddress: "93.41.102.9", location: "Milano, IT", authenticatedAt: "2026-09-15T13:10:00Z", lastActiveAt: "2026-09-15T14:30:00Z", authMethod: "PASSKEY", riskFlags: [] },
  { sessionId: "SES-40003", userId: "EMP-7003", device: "Windows 11 / Edge", ipAddress: "81.22.44.10", location: "Roma, IT", authenticatedAt: "2026-09-15T11:45:00Z", lastActiveAt: "2026-09-13T18:20:00Z", authMethod: "PASSWORD", riskFlags: ["STALE_SESSION"] }
] as const;

export interface ApplicationConfig {
  clientId: string;
  appName: string;
  grantTypes: string[];
  redirectUris: string[];
  scopes: string[];
  accessTokenLifetimeMinutes: number;
  refreshTokenLifetimeDays: number;
  pkceRequired: boolean;
  status: "ACTIVE" | "ROTATION_DUE" | "DISABLED";
  lastSecretRotation: string;
}

export const applicationConfigs: ApplicationConfig[] = [
  {
    clientId: "mobile-app",
    appName: "Retail Mobile Banking",
    grantTypes: ["authorization_code"],
    redirectUris: ["https://m.example.test/callback", "app.example.test://callback"],
    scopes: ["openid", "profile", "accounts.read", "payments.write"],
    accessTokenLifetimeMinutes: 15,
    refreshTokenLifetimeDays: 14,
    pkceRequired: true,
    status: "ACTIVE",
    lastSecretRotation: "2026-07-02T10:00:00Z"
  },
  {
    clientId: "web-portal",
    appName: "Employee Web Portal",
    grantTypes: ["authorization_code"],
    redirectUris: ["https://portal.example.test/auth/callback"],
    scopes: ["openid", "profile", "internal-tools.read"],
    accessTokenLifetimeMinutes: 30,
    refreshTokenLifetimeDays: 7,
    pkceRequired: true,
    status: "ROTATION_DUE",
    lastSecretRotation: "2026-03-18T10:00:00Z"
  },
  {
    clientId: "batch-etl",
    appName: "Nightly ETL Integration",
    grantTypes: ["client_credentials"],
    redirectUris: [],
    scopes: ["ledger.read", "ledger.write"],
    accessTokenLifetimeMinutes: 60,
    refreshTokenLifetimeDays: 0,
    pkceRequired: false,
    status: "ACTIVE",
    lastSecretRotation: "2026-08-20T02:00:00Z"
  }
] as const;
