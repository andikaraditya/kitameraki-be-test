import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import { getContainer } from "../db"
import { validateUUID } from "../validation"
import { badRequest, serverError, logRequest } from "../response"

export async function BulkDeleteTasks(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  logRequest(context, request)

  try {
    const body = (await request.json()) as string[]
    const organizationId = request.query.get("organizationId")

    const errors = [validateUUID(organizationId, "organizationId")].filter(Boolean)

    if (!Array.isArray(body) || body.length === 0) {
      errors.push({ field: "body", message: "request body must be a non-empty array of task IDs" })
    }

    if (errors.length) return badRequest(errors)

    const container = getContainer()
    const results = await Promise.allSettled(
      body.map((id) => container.item(id, organizationId).delete()),
    )

    const failed = results.filter((r) => r.status === "rejected").length
    context.log(`Deleted ${results.length - failed} tasks, ${failed} failures`)

    return { status: 200 }
  } catch (error) {
    return serverError(error, context)
  }
}

app.http("BulkDeleteTasks", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: BulkDeleteTasks,
})
