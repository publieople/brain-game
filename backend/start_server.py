#!/usr/bin/env python3
"""Start the Brain-Game backend server."""
import sys
import os
import subprocess
import time
import signal

# Activate venv
venv_python = os.path.join(os.path.dirname(__file__), ".venv", "bin", "python")

cmd = [
    venv_python, "-m", "uvicorn",
    "brain_game.main:app",
    "--host", "127.0.0.1",
    "--port", sys.argv[1] if len(sys.argv) > 1 else "8010",
]

proc = subprocess.Popen(
    cmd,
    cwd=os.path.dirname(os.path.abspath(__file__)),
    stdout=sys.stdout,
    stderr=sys.stderr,
    preexec_fn=os.setsid,  # Create new session to avoid process group issues
)

def cleanup(signum, frame):
    os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    sys.exit(0)

signal.signal(signal.SIGTERM, cleanup)
signal.signal(signal.SIGINT, cleanup)

# Wait for startup
time.sleep(2)
print(f"Server started on port {sys.argv[1] if len(sys.argv) > 1 else '8010'}", flush=True)
proc.wait()
