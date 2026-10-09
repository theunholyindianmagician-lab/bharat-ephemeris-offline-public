#!/usr/bin/env python3
"""Static server with explicit UTF-8 Content-Type for editions."""
import http.server
import socketserver
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = 8877


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def guess_type(self, path):
        base = super().guess_type(path)
        p = str(path).lower()
        if p.endswith((".html", ".htm")):
            return "text/html; charset=utf-8"
        if p.endswith(".js"):
            return "application/javascript; charset=utf-8"
        if p.endswith(".css"):
            return "text/css; charset=utf-8"
        if p.endswith(".json"):
            return "application/json; charset=utf-8"
        if p.endswith(".md"):
            return "text/markdown; charset=utf-8"
        return base

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"Serving {ROOT} at http://127.0.0.1:{PORT}/", flush=True)
        print("UTF-8 charset forced on HTML/JS/CSS/JSON", flush=True)
        httpd.serve_forever()
