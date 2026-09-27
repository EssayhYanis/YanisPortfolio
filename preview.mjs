import http from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

http
  .createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      const file = resolve(
        root,
        `.${pathname.endsWith("/") ? `${pathname}index.html` : pathname}`,
      );

      if (!file.startsWith(resolve(root) + sep)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      const data = await readFile(file);
      response.writeHead(200, {
        "Content-Type":
          types[extname(file).toLowerCase()] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(data);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  })
  .listen(4173, "127.0.0.1", () => {
    console.log("Portfolio preview: http://127.0.0.1:4173");
  });
