const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface ValidationError {
  field: string
  message: string
}

export function validateUUID(value: unknown, field: string): ValidationError | null {
  if (!value || typeof value !== "string" || !UUID_REGEX.test(value.trim())) {
    return { field, message: `${field} must be a valid UUID` }
  }
  return null
}

export function validateMaxLength(
  value: unknown,
  field: string,
  max: number,
): ValidationError | null {
  if (value !== undefined && value !== null && typeof value === "string" && value.length > max) {
    return { field, message: `${field} must be at most ${max} characters` }
  }
  return null
}

export function validateEnum(
  value: unknown,
  field: string,
  validValues: string[],
): ValidationError | null {
  if (
    value !== undefined &&
    value !== null &&
    typeof value === "string" &&
    !validValues.includes(value)
  ) {
    return { field, message: `${field} must be one of: ${validValues.join(", ")}` }
  }
  return null
}

export function validateTags(value: unknown): ValidationError | null {
  if (value === undefined || value === null) return null
  if (!Array.isArray(value)) {
    return { field: "tags", message: "tags must be an array of strings" }
  }
  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== "string") {
      return { field: `tags[${i}]`, message: "each tag must be a string" }
    }
    if (value[i].length > 50) {
      return { field: `tags[${i}]`, message: "each tag must be at most 50 characters" }
    }
  }
  return null
}

export function validateTaskIdAndOrg(taskId: unknown, orgId: unknown): ValidationError[] {
  return [validateUUID(taskId, "id"), validateUUID(orgId, "organizationId")].filter(
    Boolean,
  ) as ValidationError[]
}

export function validateTaskBody(body: Record<string, unknown>): ValidationError[] {
  return [
    validateUUID(body.id, "id"),
    validateUUID(body.organizationId, "organizationId"),
    validateMaxLength(body.title, "title", 100),
    validateMaxLength(body.description, "description", 1000),
    validateEnum(body.priority, "priority", ["low", "medium", "high"]),
    validateEnum(body.status, "status", ["todo", "in-progress", "completed"]),
    validateTags(body.tags),
  ].filter(Boolean) as ValidationError[]
}
