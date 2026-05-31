import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import { getContainer, validateTaskBody } from "../validation"
import { badRequest, serverError } from "../response"

export async function InsertTask(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const errors = validateTaskBody(body)
    if (errors.length) return badRequest(errors)

    const container = getContainer()
    const { resource } = await container.items.create(body)

    return { jsonBody: resource, status: 200 }
  } catch (error) {
    return serverError(error, context)
  }
}

app.http("InsertTask", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: InsertTask,
})
