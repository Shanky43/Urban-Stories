import {NextResponse} from "next/server";
import {ZodError} from "zod";

export function apiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({error: "Invalid request", details: error.issues.map((issue) => ({path: issue.path, message: issue.message}))}, {status: 400});
  }
  const message = error instanceof Error ? error.message : "Unexpected server error";
  const status = message === "UNAUTHENTICATED" ? 401 : message === "FORBIDDEN" ? 403 : 500;
  return NextResponse.json({error: status === 500 ? "Something went wrong" : message}, {status});
}
