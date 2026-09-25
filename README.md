# Demo MCP

A synthetic demo exposing six independent MCP servers from a single Node.js Express app:

- `/mcp/customer`
- `/mcp/portfolio`
- `/mcp/products`
- `/mcp/mortgage`
- `/mcp/ops`
- `/mcp/iam`

Each endpoint exposes four tools — three for `/mcp/ops`. All data is static. Write tools validate and acknowledge the request but explicitly return `persisted: false`.

## Protocol and hosting model

This project uses the v2 split packages from the official TypeScript MCP SDK and `createMcpHandler`, which creates a fresh MCP server per HTTP request. Responses are configured as JSON-only, making the endpoints well suited to stateless deployments and high-risk-tool demos where no server-side session or mutable state is required.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
```

For production deployments, set these environment variables:

```text
ALLOWED_HOSTS=your-host.example.com
ALLOWED_ORIGINS=your-client.example.com
```

## Test

Health check:

```bash
curl http://localhost:3000/health
```

List customer tools:

```bash
curl -sS http://localhost:3000/mcp/customer \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Call a read tool:

```bash
curl -sS http://localhost:3000/mcp/customer \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_customer","arguments":{"customerId":"CUST-10001"}}}'
```

Call a high-risk demo write:

```bash
curl -sS http://localhost:3000/mcp/customer \
  -X POST \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"update_customer","arguments":{"customerId":"CUST-10001","phone":"+39 320 555 0199","reason":"Customer requested a phone-number change","confirmedByUser":true}}}'
```

The response includes `demoMode: true` and `persisted: false`.

## Tool catalogue

### Customer MCP
- `get_customer`
- `search_customers`
- `update_customer` — high-risk write simulation
- `get_customer_transactions`

### Portfolio MCP
- `get_portfolio_summary`
- `list_positions`
- `simulate_trade`
- `submit_trade_order` — high-risk write simulation

### Products MCP
- `list_products`
- `get_product_details`
- `compare_products`
- `request_product_application` — write simulation

### Mortgage MCP
- `get_mortgage_summary`
- `calculate_affordability`
- `generate_rate_quote`
- `submit_mortgage_change_request` — high-risk write simulation

### Ops MCP
- `get_service_health`
- `search_errors`
- `analyze_error`

### IAM MCP
- `get_user_identity` — by `userId` or `email`
- `list_user_sessions`
- `get_application_config`
- `unlock_account` — high-risk write simulation

## Safety characteristics for demos

- Synthetic customer and account data only.
- No database, cache, filesystem writes or third-party calls.
- Every write requires `confirmedByUser: true` at schema-validation level.
- Tool annotations distinguish read-only, simulated-write and destructive/high-risk operations.
- Every write response states that nothing was persisted.
- JSON-only MCP responses avoid long-lived streaming for these simple request/response tools.
