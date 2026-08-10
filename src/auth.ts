import { createRemoteJWKSet, jwtVerify, type JWTVerifyOptions } from "jose";
import type { NextFunction, Request, Response } from "express";

let cachedJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks(uri: string) {
  if (!cachedJwks) {
    cachedJwks = createRemoteJWKSet(new URL(uri));
  }
  return cachedJwks;
}

export function jwtMiddleware(req: Request, res: Response, next: NextFunction): void {
  const enabled = (process.env.OAUTH_ENABLED ?? "").toLowerCase();
  if (enabled !== "true") {
    next();
    return;
  }

  const jwksUri = process.env.JWKS_URI;
  if (!jwksUri) {
    res.status(500).json({ error: "JWKS_URI is not configured" });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  const opts: JWTVerifyOptions = {};
  const audience = process.env.JWT_AUDIENCE;
  if (audience) opts.audience = audience;

  jwtVerify(token, getJwks(jwksUri), opts)
    .then(() => next())
    .catch(() => {
      res.status(401).json({ error: "Invalid or expired token" });
    });
}
