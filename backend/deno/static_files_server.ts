export { serveFile } from "https://deno.land/std@0.83.0/http/file_server.ts";

export function doesFileExist(path: string | URL) {
  return Deno.stat(path).then((info) => info.isFile).catch((error) => {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    } else {
      return Promise.reject(
        new Error(
          `Unknown error when checking if file ${path} exists: ${error.message}`,
        ),
      );
    }
  });
}
