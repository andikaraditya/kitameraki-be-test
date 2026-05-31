import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import { getSettingsContainer } from "../db"
import { validateUUID, validateMaxLength, ValidationError } from "../validation"
import { ok, badRequest, serverError, logRequest } from "../response"

export async function GetSetting(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") return ok()

  logRequest(context, request)

  try {
    const organizationId = request.query.get("organizationId")
    const name = request.query.get("name")

    const errors: ValidationError[] = [
      validateUUID(organizationId, "organizationId"),
      validateMaxLength(name, "name", 100),
    ]

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      errors.push({ field: "name", message: "name is required and must be a non-empty string" })
    }

    const filtered = errors.filter(Boolean)
    if (filtered.length) return badRequest(filtered)

    const id = `${organizationId}:${name}`
    const container = getSettingsContainer()
    const { resource } = await container.item(id, organizationId).read()

    return ok(resource)
  } catch (error) {
    return serverError(error, context)
  }
}

app.http("GetSetting", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  handler: GetSetting,
})
