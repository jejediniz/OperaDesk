const { clearAuthCookie, noContent, run } = require("../../../../src/server/http/nextApi");

export async function POST() {
  return run(async () => {
    const response = noContent();
    clearAuthCookie(response);
    return response;
  });
}
