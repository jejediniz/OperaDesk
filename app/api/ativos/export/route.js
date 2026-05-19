const { NextResponse } = require("next/server");

const ativosService = require("../../../../src/server/services/ativosService");
const { listAtivosQuerySchema } = require("../../../../src/server/validators/ativosSchemas");
const { coerceAtivosListQuery } = require("../../../../src/server/http/coerceAtivosListQuery");
const {
  authenticate,
  queryObject,
  requireTiOuAdmin,
  run,
  validate
} = require("../../../../src/server/http/nextApi");

export async function GET(request) {
  return run(async () => {
    const user = authenticate(request);
    requireTiOuAdmin(user);
    const filtros = validate(listAtivosQuerySchema, coerceAtivosListQuery(queryObject(request)));
    const { csv, truncado } = await ativosService.exportarAtivosCsv(filtros);

    const bom = "\uFEFF";
    const body = bom + csv;
    const ts = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "").replace("T", "-");
    const filename = `ativos-export-${ts}.csv`;

    const headers = {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    };
    if (truncado) {
      headers["X-Export-Truncated"] = "true";
    }

    return new NextResponse(body, { status: 200, headers });
  });
}
