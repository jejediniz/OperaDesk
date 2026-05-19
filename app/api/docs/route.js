const { renderDocsHtml } = require("../../../src/server/docs/openapi");
const { NextResponse } = require("next/server");

export function GET() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_API_DOCS !== "true") {
    return NextResponse.json(
      { success: false, error: { message: "Não encontrado" } },
      { status: 404 }
    );
  }
  return new NextResponse(renderDocsHtml("/api/docs/openapi"), {
    headers: {
      "content-type": "text/html; charset=utf-8"
    }
  });
}
