import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import { getSettingsContainer } from "../db"
import { validateUUID, validateMaxLength, ValidationError } from "../validation"
import { ok, badRequest, serverError } from "../response"

export async function UpsertSetting(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") return ok()

  try {
    const body = (await request.json()) as Record<string, unknown>
    const { organizationId, name, config: configValue } = body

    const errors: ValidationError[] = [
      validateUUID(organizationId, "organizationId"),
      validateMaxLength(name, "name", 100),
    ]

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      errors.push({ field: "name", message: "name is required and must be a non-empty string" })
    }

    if (configValue === undefined || configValue === null || typeof configValue !== "object" || Array.isArray(configValue)) {
      errors.push({ field: "config", message: "config is required and must be a JSON object" })
    }

    const filtered = errors.filter(Boolean)
    if (filtered.length) return badRequest(filtered)

    const id = `${organizationId}:${name}`
    const container = getSettingsContainer()
    const { resource } = await container.items.upsert({
      id,
      organizationId,
      name,
      config: configValue,
    })

    return ok(resource)
  } catch (error) {
    return serverError(error, context)
  }
}

app.http("UpsertSetting", {
  methods: ["PUT", "OPTIONS"],
  authLevel: "anonymous",
  handler: UpsertSetting,
})
