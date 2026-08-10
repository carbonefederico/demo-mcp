import type { CallToolResult } from "@modelcontextprotocol/server";

export function ok(data: unknown, message?: string): CallToolResult {
  return {
    content: [{ type: "text", text: message ?? JSON.stringify(data, null, 2) }],
    structuredContent: data as Record<string, unknown>
  };
}

export function error(message: string, details?: unknown): CallToolResult {
  return {
    isError: true,
    content: [{ type: "text", text: details ? `${message}\n${JSON.stringify(details, null, 2)}` : message }]
  };
}

export function demoWriteResult(action: string, payload: unknown, approvalRequired = true): CallToolResult {
  const data = {
    demoMode: true,
    persisted: false,
    action,
    approvalRequired,
    requestId: `DEMO-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    payload,
    message: "Demo only: the request was validated and acknowledged, but no state was changed."
  };
  return ok(data);
}
