"""Serve the preview with explicit module MIME types on Windows and Unix."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class PreviewHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".css": "text/css",
    }


class PreviewServer(ThreadingHTTPServer):
    # Multiple pages may request all ES module dependencies at once.
    request_queue_size = 128


if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent / "preview"
    server = PreviewServer(("127.0.0.1", 8080), partial(PreviewHandler, directory=str(root)))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
