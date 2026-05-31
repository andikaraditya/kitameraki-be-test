import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import { getContainer } from "../db"
import { validateTaskBody } from "../validation"
import { ok, badRequest, serverError, logRequest } from "../response"

export async function InsertTask(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") return ok()

  try {
    logRequest(context, request)
    const body = (await request.json()) as Record<string, unknown>
    const errors = validateTaskBody(body)
    if (errors.length) return badRequest(errors)

    const container = getContainer()
    const { resource } = await container.items.create(body)

    return ok(resource)
  } catch (error) {
    return serverError(error, context)
  }
}

app.http("InsertTask", {
  methods: ["POST", "OPTIONS"],
  authLevel: "anonymous",
  handler: InsertTask,
})
