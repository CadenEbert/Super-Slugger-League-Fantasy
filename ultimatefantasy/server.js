require('dotenv').config();
const http = require("http");
const path = require('path');
const fs = require("fs");
const URL = require("url").URL;
const crypto = require("crypto");
const { Server } = require('socket.io');
const { setupDraftChannel, setUpScheduleChannel } = require('./src/app/backend/supabase');
const app = require('./src/app/backend/app');
const debug = require("debug")("node-angular");

const normalizedPort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
};

var PORT = normalizedPort(process.env.PORT || 3000);
app.set('port', PORT);
const HOST = process.env.HOST || "127.0.0.1";

const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX = 120;
const buckets = new Map();

function rateLimit(ip) {
  const now = Date.now();
  const entry = buckets.get(ip);
  if (!entry || entry.resetAt <= now) {
    buckets.set(ip, { resetAt: now + RATE_LIMIT_WINDOW_MS, count: 1 });
    return { ok: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  entry.count += 1;
  const remaining = Math.max(0, RATE_LIMIT_MAX - entry.count);
  return { ok: entry.count <= RATE_LIMIT_MAX, remaining, resetAt: entry.resetAt };
}

function send(res, statusCode, body, headers = {}) {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  const baseHeaders = {
    "Content-Type": typeof body === "string" ? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    ...headers,
  };
  res.writeHead(statusCode, baseHeaders);
  res.end(payload);
}

function safeLogLine(req, statusCode) {
  const ip = req.socket.remoteAddress ?? "unknown";
  const method = req.method ?? "UNKNOWN";
  const url = req.url ?? "/";
  console.log(`${new Date().toISOString()} ${ip} ${method} ${url} ${statusCode}`);
}

const onListening = () => {
  const addr = server.address();
  const bind = typeof PORT === "string" ? "pipe " + PORT : "port " + PORT;
  debug("Listening on " + bind);
};

const onError = error => {
  if (error.syscall !== "listen") throw error;
  const bind = typeof PORT === "string" ? "pipe " + PORT : "port " + PORT;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer((req, res) => {
  try {
    const u = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (u.pathname.startsWith("/api")) {
      app(req, res);
      return;
    }

    const method = req.method || "GET";
    if (!["GET", "HEAD"].includes(method)) {
      send(res, 405, { error: "Method Not Allowed" }, { "Allow": "GET, HEAD" });
      safeLogLine(req, 405);
      return;
    }

    const ip = req.socket.remoteAddress || "unknown";
    const rl = rateLimit(ip);
    res.setHeader("RateLimit-Limit", String(RATE_LIMIT_MAX));
    res.setHeader("RateLimit-Remaining", String(rl.remaining));
    res.setHeader("RateLimit-Reset", String(Math.ceil(rl.resetAt / 1000)));
    if (!rl.ok) {
      send(res, 429, { error: "Too Many Requests" });
      safeLogLine(req, 429);
      return;
    }

    if (u.pathname === "/health") {
      send(res, 200, { ok: true });
      safeLogLine(req, 200);
      return;
    }

    if (u.pathname === "/" || u.pathname === "/index.html") {
      u.pathname = "/index.html";
    }

    const isFrontendAsset = u.pathname.startsWith("/assets/") ||
      u.pathname === "/favicon.ico" ||
      u.pathname === "/index.html" ||
      u.pathname.endsWith(".js") ||
      u.pathname.endsWith(".css");

    if (isFrontendAsset) {
      const targetPath = path.join(process.cwd(), 'dist/ultimatefantasy/browser', u.pathname);

      if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
        const ext = path.extname(targetPath).toLowerCase();
        let mimeType = "application/octet-stream";

        if (ext === ".html") mimeType = "text/html; charset=utf-8";
        else if (ext === ".ico") mimeType = "image/x-icon";
        else if (ext === ".png") mimeType = "image/png";
        else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
        else if (ext === ".gif") mimeType = "image/gif";
        else if (ext === ".svg") mimeType = "image/svg+xml";
        else if (ext === ".css") mimeType = "text/css";
        else if (ext === ".js") mimeType = "application/javascript";

        res.writeHead(200, {
          "Content-Type": mimeType,
          "Cache-Control": u.pathname === "/index.html" ? "no-cache" : "public, max-age=2592000"
        });
        fs.createReadStream(targetPath).pipe(res);
        safeLogLine(req, 200);
        return;
      }
    }





    if (u.pathname === "/nonce") {
      const nonce = crypto.randomBytes(16).toString("hex");
      send(res, 200, { nonce });
      safeLogLine(req, 200);
      return;
    }

    send(res, 404, { error: "Not Found" });
    safeLogLine(req, 404);
  } catch (err) {
    send(res, 500, { error: "Internal Server Error" });
    console.error(err);
    safeLogLine(req, 500);
  }
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

io.on('connection', (socket) => {
  socket.on('joinDraft', (draftId) => {
    setupDraftChannel(io, draftId);
    socket.join(`draft_${draftId}`);
  });

  socket.on('joinSchedule', (leagueId) => {
    setUpScheduleChannel(io, leagueId);
    socket.join(`schedule_${leagueId}`);
    console.log(`Socket ${socket.id} joined schedule channel for league ${leagueId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.on("clientError", (_err, socket) => socket.end("HTTP/1.1 400 Bad Request\r\n\r\n"));

server.listen(PORT, HOST, () => {
  console.log(`Listening on http://${HOST}:${PORT}`);
});

server.on("error", onError);
server.on("listening", onListening);

module.exports.io = io;