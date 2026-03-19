#!/usr/bin/env node
import http from "node:http";
import { compileDsl } from "@lowcode/compiler";

const port = 4177;

function jsonResponse(res, statusCode, body) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    jsonResponse(res, 200, { ok: true });
    return;
  }

  if (req.method !== "POST" || req.url !== "/compile") {
    jsonResponse(res, 404, { ok: false, error: "Not found" });
    return;
  }

  let raw = "";

  req.on("data", (chunk) => {
    raw += chunk.toString("utf8");
  });

  req.on("end", () => {
    try {
      const dsl = JSON.parse(raw.replace(/^\uFEFF/, ""));
      const result = compileDsl(dsl);

      if (!result.ok) {
        jsonResponse(res, 200, {
          ok: false,
          errors: result.errors ?? []
        });
        return;
      }

      jsonResponse(res, 200, {
        ok: true,
        output: result.output
      });
    } catch (error) {
      jsonResponse(res, 400, {
        ok: false,
        errors: [
          {
            path: "/",
            message: error instanceof Error ? error.message : "Invalid JSON",
            code: "INVALID_JSON"
          }
        ]
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Authoring compile server listening on http://localhost:${port}`);
});