import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import { getContainer } from "../db"
import { validateUUID } from "../validation"
import { badRequest, serverError, logRequest } from "../response"

export async function GetTasks(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
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

    return { jsonBody: resources, status: 200 }
  } catch (error) {
    return serverError(error, context)
  }
}

app.http("GetTasks", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: GetTasks,
})
