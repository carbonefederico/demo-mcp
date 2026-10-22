import { createRemoteJWKSet, jwtVerify, type JWTVerifyOptions } from "jose";
import type { NextFunction, Request, Response } from "express";

// Demo-only diagnostics: the Authorization header is logged partially
// obfuscated and JWT claims are printed decoded (signature not verified).
// Not suitable for production.
let cachedJwksSets: ReturnType<typeof createRemoteJWKSet>[] | null = null;

function jwksUris(): string[] {
  return (process.env.JWKS_URI ?? "")
    .split(",")
    .map(v => v.trim())
    .filter(v => {
      try {
        new URL(v);
        return true;
      } catch {
        console.warn(`[auth] Ignoring invalid JWKS_URI entry: ${v}`);
        return false;
      }
    });
}

function getJwksSets(): ReturnType<typeof createRemoteJWKSet>[] {
  if (!cachedJwksSets) {
    cachedJwksSets = jwksUris().map(uri => createRemoteJWKSet(new URL(uri)));
  }
  return cachedJwksSets;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const parsed: unknown = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return parsed !== null && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

// JWT header and payload are not secrets (the payload is printed decoded
// below anyway), so the obfuscation masks only the signature tail.
function obfuscate(value: string): string {
  if (value.length <= 72) return `${value.slice(0, 36)}…(${value.length} chars)`;
  return `${value.slice(0, 60)}…(+${value.length - 60} chars, tail masked)`;
}

function logAuthorization(authHeader: string): void {
  console.log(`[auth] Authorization: ${obfuscate(authHeader)}`);
  const claims = decodeJwtPayload(authHeader.slice(7));
  if (claims) {
    console.log(`[auth] Token claims (decoded, not verified): ${JSON.stringify(claims)}`);
  } else {
    console.log("[auth] Token payload could not be decoded as a JWT");
  }
}

export async function jwtMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) logAuthorization(authHeader);

  const enabled = (process.env.OAUTH_ENABLED ?? "").toLowerCase();
  if (enabled !== "true") {
    next();
    return;
  }

  const uris = jwksUris();
  if (uris.length === 0) {
    res.status(500).json({ error: "JWKS_URI is not configured (comma-separated list of JWKS endpoints)" });
    return;
  }

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  const opts: JWTVerifyOptions = {};
  const audience = process.env.JWT_AUDIENCE;
  if (audience) opts.audience = audience;

  const sets = getJwksSets();
  for (let i = 0; i < sets.length; i++) {
    try {
      await jwtVerify(token, sets[i], opts);
      console.log(`[auth] Token verified against JWKS ${i + 1}/${sets.length}: ${uris[i]}`);
      next();
      return;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.log(`[auth] Token rejected by JWKS ${i + 1}/${sets.length} (${uris[i]}): ${reason}`);
    }
  }
  res.status(401).json({ error: "Invalid or expired token" });
}
