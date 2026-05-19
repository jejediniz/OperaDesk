export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Importa lazily para evitar que o analisador estático do Turbopack
  // marque APIs Node como incompatíveis com o Edge Runtime.
  await import("./src/server/bootstrap.js");
}
