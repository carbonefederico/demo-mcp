import express, { type NextFunction, type Request, type Response } from "express";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { buildCustomerServer, buildMortgageServer, buildPortfolioServer, buildProductsServer } from "./tools.js";
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

app.use(jwtMiddleware);

const handlers = {
  customer: createMcpHandler(buildCustomerServer, { responseMode: "json" }),
  portfolio: createMcpHandler(buildPortfolioServer, { responseMode: "json" }),
  products: createMcpHandler(buildProductsServer, { responseMode: "json" }),
  mortgage: createMcpHandler(buildMortgageServer, { responseMode: "json" })
};

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", demoMode: true, persistence: false, protocol: "MCP 2026-07-28 / stateless per request", endpoints: Object.keys(handlers).map(name => `/mcp/${name}`) });
});

for (const [name, handler] of Object.entries(handlers)) {
  app.all(`/mcp/${name}`, toNodeHandler(handler));
}

app.get("/", (_req: Request, res: Response) => {
  res.json({ name: "Demo MCP Server", warning: "All data is synthetic. Write tools acknowledge requests but do not persist changes.", health: "/health", mcpEndpoints: { customer: "/mcp/customer", portfolio: "/mcp/portfolio", products: "/mcp/products", mortgage: "/mcp/mortgage" } });
});

const port = process.env.PORT ?? 3000;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));

export default app;
