import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import { getContainer } from "../db"
import { validateTaskIdAndOrg } from "../validation"
import { badRequest, serverError, logRequest } from "../response"

export async function DeleteTask(
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
    await container.item(taskId, organizationId).delete()

    return { status: 200 }
  } catch (error) {
    return serverError(error, context)
  }
}

app.http("DeleteTask", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: DeleteTask,
})
