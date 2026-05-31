import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import { getContainer } from "../db"
import { validateTaskIdAndOrg } from "../validation"
import { badRequest, serverError, logRequest } from "../response"

export async function GetTask(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  logRequest(context, request)

  try {
    const taskId = request.query.get("id")
    const organizationId = request.query.get("organizationId")

    const errors = validateTaskIdAndOrg(taskId, organizationId)
    if (errors.length) return badRequest(errors)

    const container = getContainer()
    const { resource } = await container.item(taskId, organizationId).read()

    return { jsonBody: resource, status: 200 }
  } catch (error) {
    return serverError(error, context)
  }
}

app.http("GetTask", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: GetTask,
})
