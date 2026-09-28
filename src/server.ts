import express, { type NextFunction, type Request, type Response } from "express";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { buildCustomerServer, buildIamServer, buildMortgageServer, buildOpsServer, buildPortfolioServer, buildProductsServer } from "./tools.js";
import { jwtMiddleware } from "./auth.js";

const app = express();

function csvEnv(name: string): string[] {
  return (process.env[name] ?? "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
}

app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedHosts = csvEnv("ALLOWED_HOSTS");
  const allowedOrigins = csvEnv("ALLOWED_ORIGINS");
  const host = (req.hostname || "").toLowerCase();
  const originHeader = req.get("origin");

  if (allowedHosts.length > 0 && !allowedHosts.includes(host)) {
    res.status(403).json({ error: "Host not allowed" });
    return;
  }

  if (originHeader && allowedOrigins.length > 0) {
    try {
      const originHost = new URL(originHeader).hostname.toLowerCase();
      if (!allowedOrigins.includes(originHost)) {
        res.status(403).json({ error: "Origin not allowed" });
        return;
      }
    } catch {
      res.status(400).json({ error: "Invalid Origin header" });
      return;
    }
  }

  next();
});

// RFC 9728 protected-resource metadata: one document per MCP endpoint at the
// path-preserved well-known location. The resource identifier is derived per
// request — scheme and host from X-Forwarded-* (falling back to Host), path
// from the request minus the well-known prefix, plus an optional
// X-Forwarded-Prefix contributed by the front door — so the document always
// names the client-facing URI the token binds to (RFC 8707), be it a gateway,
// a tunnel or localhost.
const WELL_KNOWN_PREFIX = "/.well-known/oauth-protected-resource";

const SERVER_SCOPES: Record<string, string[]> = {
  customer: ["customer:read", "customer:write"],
  portfolio: ["portfolio:read", "portfolio:write"],
  products: ["products:read", "products:write"],
  mortgage: ["mortgage:read", "mortgage:write"],
  ops: ["ops:read"],
  iam: ["iam:read", "iam:write"]
};

function authorizationServers(): string[] {
  if (process.env.OAUTH_ISSUER) return [process.env.OAUTH_ISSUER];
  if (process.env.JWKS_URI) {
    try {
      const jwks = new URL(process.env.JWKS_URI);
      const base = jwks.pathname.replace(/\/\.well-known\/jwks\.json$/, "");
      return [`${jwks.protocol}//${jwks.host}${base}`];
    } catch {
      // fall through to omitting authorization_servers
    }
  }
  return [];
}

function resourceForRequest(req: Request): { resource: string; endpoint: string } | null {
  const host = (req.get("x-forwarded-host") ?? req.get("host") ?? "").split(",")[0].trim().toLowerCase();
  const proto = (req.get("x-forwarded-proto") ?? req.protocol).split(",")[0].trim().toLowerCase();
  if (!host || !/^[a-z0-9.\-]+(?::\d{1,5})?$/.test(host) || (proto !== "http" && proto !== "https")) return null;

  const resourcePath = (req.get("x-forwarded-prefix") ?? "").replace(/\/+$/, "") +
    req.originalUrl.split("?")[0].slice(WELL_KNOWN_PREFIX.length);
  const endpoint = Object.keys(SERVER_SCOPES).find(name => resourcePath.endsWith(`/mcp/${name}`));
  return endpoint ? { resource: `${proto}://${host}${resourcePath}`, endpoint } : null;
}

app.get(`${WELL_KNOWN_PREFIX}/*splat`, (req: Request, res: Response) => {
  const match = resourceForRequest(req);
  if (!match) {
    res.status(404).json({ error: "Unknown protected resource" });
    return;
  }
  const doc: Record<string, unknown> = {
    resource: match.resource,
    scopes_supported: SERVER_SCOPES[match.endpoint],
    bearer_methods_supported: ["header"]
  };
  const authServers = authorizationServers();
  if (authServers.length > 0) doc.authorization_servers = authServers;
  res.json(doc);
});

app.use(jwtMiddleware);

const handlers = {
  customer: createMcpHandler(buildCustomerServer, { responseMode: "json" }),
  portfolio: createMcpHandler(buildPortfolioServer, { responseMode: "json" }),
  products: createMcpHandler(buildProductsServer, { responseMode: "json" }),
  mortgage: createMcpHandler(buildMortgageServer, { responseMode: "json" }),
  ops: createMcpHandler(buildOpsServer, { responseMode: "json" }),
  iam: createMcpHandler(buildIamServer, { responseMode: "json" })
};

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", demoMode: true, persistence: false, protocol: "MCP 2026-07-28 / stateless per request", endpoints: Object.keys(handlers).map(name => `/mcp/${name}`) });
});

for (const [name, handler] of Object.entries(handlers)) {
  app.all(`/mcp/${name}`, toNodeHandler(handler));
}

app.get("/", (_req: Request, res: Response) => {
  res.json({ name: "Demo MCP Server", warning: "All data is synthetic. Write tools acknowledge requests but do not persist changes.", health: "/health", mcpEndpoints: { customer: "/mcp/customer", portfolio: "/mcp/portfolio", products: "/mcp/products", mortgage: "/mcp/mortgage", ops: "/mcp/ops", iam: "/mcp/iam" } });
});

const port = process.env.PORT ?? 3000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));

export default app;
