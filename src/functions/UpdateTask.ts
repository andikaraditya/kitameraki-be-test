import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import { getContainer } from "../db"
import { validateTaskBody, validateTaskIdAndOrg } from "../validation"
import { badRequest, serverError } from "../response"

export async function UpdateTask(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const taskId = request.query.get("id")
    const organizationId = request.query.get("organizationId")

    const errors = [...validateTaskIdAndOrg(taskId, organizationId), ...validateTaskBody(body)]
    if (errors.length) return badRequest(errors)

    const patchOperations = Object.entries(body).map(([key, value]) => ({
      op: "replace" as const,
      path: `/${key}`,
      value,
    }))

    const container = getContainer()
    const { resource } = await container.item(taskId, organizationId).patch(patchOperations)

    return { jsonBody: resource, status: 200 }
  } catch (error) {
    return serverError(error, context)
  }
}

app.http("UpdateTask", {
  methods: ["PATCH"],
  authLevel: "anonymous",
  handler: UpdateTask,
})
