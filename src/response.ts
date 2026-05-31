import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import { ValidationError } from "./validation"

export function logRequest(context: InvocationContext, request: HttpRequest): void {
  context.log(`Http function processed request for url "${request.url}"`)
}

export function badRequest(errors: ValidationError[]): HttpResponseInit {
  return { status: 400, jsonBody: { error: "Validation failed", details: errors } }
}

export function serverError(error: unknown, context: InvocationContext): HttpResponseInit {
  context.log(`Error: ${error}`)
  return { status: 500, jsonBody: { error: "Internal server error" } }
}
