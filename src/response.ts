import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import { ValidationError } from "./validation"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

export function logRequest(context: InvocationContext, request: HttpRequest): void {
  context.log(`Http function processed request for url "${request.url}"`)
}

export function ok(body?: unknown): HttpResponseInit {
  return { jsonBody: body, status: 200, headers: corsHeaders }
}

export function badRequest(errors: ValidationError[]): HttpResponseInit {
  return {
    status: 400,
    jsonBody: { error: "Validation failed", details: errors },
    headers: corsHeaders,
  }
}

export function serverError(error: unknown, context: InvocationContext): HttpResponseInit {
  context.log(`Error: ${error}`)
  return { status: 500, jsonBody: { error: "Internal server error" }, headers: corsHeaders }
}
