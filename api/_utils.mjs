import { createClient } from "@supabase/supabase-js";

export const BUCKET_NAME = process.env.SUPABASE_BUCKET || "recruit-files";

export function getCorsHeaders(req) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";
  const requestOrigin = req?.headers?.origin;
  const origin = allowedOrigin === "*" ? "*" : allowedOrigin;

  if (allowedOrigin !== "*" && requestOrigin && requestOrigin !== allowedOrigin) {
    return {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json; charset=utf-8",
      "Vary": "Origin"
    };
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin"
  };
}

export function handleOptions(req, res) {
  if (req.method !== "OPTIONS") return false;
  res.writeHead(204, getCorsHeaders(req));
  res.end();
  return true;
}

export function sendJson(req, res, status, payload) {
  res.writeHead(status, getCorsHeaders(req));
  res.end(JSON.stringify(payload));
}

export function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body);
  return {};
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export function cleanExtension(name = "") {
  return (name.split(".").pop() || "bin").replace(/[^a-z0-9]/gi, "").slice(0, 12) || "bin";
}

export function assertText(value, message) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(message);
  }
  return value.trim();
}
