#!/usr/bin/env python3
"""Serve a Qinglan Night Web export and open it in the default browser."""

from __future__ import annotations

import argparse
import functools
import http.server
import socket
import socketserver
import sys
import threading
import webbrowser
from pathlib import Path


class ReusableThreadingServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


def find_available_port(preferred_port: int) -> int:
    for port in range(preferred_port, preferred_port + 20):
        with socket.socket() as probe:
            try:
                probe.bind(("127.0.0.1", port))
            except OSError:
                continue
            return port
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        return int(probe.getsockname()[1])


def main() -> int:
    parser = argparse.ArgumentParser(description="Launch the Qinglan Night Web demo.")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--no-browser", action="store_true")
    parser.add_argument("--directory", type=Path, default=Path(__file__).resolve().parent)
    args = parser.parse_args()

    root = args.directory.resolve()
    if not (root / "index.html").is_file():
        print(f"找不到试玩文件：{root / 'index.html'}", file=sys.stderr)
        return 1

    port = find_available_port(args.port)
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(root))
    with ReusableThreadingServer(("127.0.0.1", port), handler) as server:
        url = f"http://127.0.0.1:{port}/index.html"
        print("青岚夜行已启动。")
        print(f"试玩地址：{url}")
        print("关闭此窗口即可停止本地服务。")
        if not args.no_browser:
            threading.Timer(0.5, lambda: webbrowser.open(url)).start()
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\n试玩服务已停止。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
