const chamadosService = require("../../../../src/server/services/chamadosService");
const AppError = require("../../../../src/server/utils/AppError");
const { updateChamadoSchema } = require("../../../../src/server/validators/chamadosSchemas");
const {
  authenticate,
  noContent,
  readBody,
  routeParams,
  run,
  success,
  validate
} = require("../../../../src/server/http/nextApi");

export async function GET(request, context) {
  return run(async () => {
    const user = authenticate(request);
    const { id } = await routeParams(context);
    const buscarQualquer = user.tipo === "ti" || user.admin === true;
    const chamado = await chamadosService.findById(id, user.id, { buscarQualquer });

    if (!chamado) {
      throw new AppError("Chamado não encontrado", 404);
    }

    return success(chamado, "Chamado encontrado");
  });
}

export async function PUT(request, context) {
  return run(async () => {
    const user = authenticate(request);
    const { id } = await routeParams(context);
    const body = validate(updateChamadoSchema, await readBody(request));
    const atualizarQualquer = user.tipo === "ti";
    const podeAtribuir = user.tipo === "ti" || user.admin === true;
    const chamado = await chamadosService.update(id, body, user.id, {
      atualizarQualquer,
      podeAtribuir
    });

    if (!chamado) {
      throw new AppError("Chamado não encontrado", 404);
    }

    return success(chamado, "Chamado atualizado com sucesso");
  });
}

export async function DELETE(request, context) {
  return run(async () => {
    const user = authenticate(request);
    const { id } = await routeParams(context);
    const deletarQualquer = user.admin === true;
    const removido = await chamadosService.remove(id, user.id, { deletarQualquer });

    if (!removido) {
      throw new AppError("Chamado não encontrado", 404);
    }

    return noContent();
  });
}
