import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import { getContainer } from "../db"
import { validateUUID } from "../validation"
import { ok, badRequest, serverError, logRequest } from "../response"

export async function GetTasks(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") return ok()

  logRequest(context, request)

  try {
    const organizationId = request.query.get("organizationId")
    const errors = [validateUUID(organizationId, "organizationId")].filter(Boolean)
    if (errors.length) return badRequest(errors)

    const container = getContainer()
    const { resources } = await container.items
      .query({
        query: "SELECT * FROM c WHERE c.organizationId = @orgId",
        parameters: [{ name: "@orgId", value: organizationId }],
      })
      .fetchNext()

    return ok(resources)
  } catch (error) {
    return serverError(error, context)
  }
}

app.http("GetTasks", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  handler: GetTasks,
})
