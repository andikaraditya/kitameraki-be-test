import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import { getSettingsContainer } from "../db"
import { validateUUID, ValidationError } from "../validation"
import { ok, badRequest, serverError, logRequest } from "../response"

export async function ListSettings(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") return ok()

  logRequest(context, request)

  try {
    const organizationId = request.query.get("organizationId")

    const errors: ValidationError[] = [
      validateUUID(organizationId, "organizationId"),
    ].filter(Boolean)

    if (errors.length) return badRequest(errors)

    const container = getSettingsContainer()
    const { resources } = await container.items
      .query({
        query: "SELECT * FROM c WHERE c.organizationId = @orgId",
        parameters: [{ name: "@orgId", value: organizationId! }],
      })
      .fetchNext()

    return ok(resources)
  } catch (error) {
    return serverError(error, context)
  }
}

app.http("ListSettings", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  handler: ListSettings,
})
