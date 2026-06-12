#!/usr/bin/env python3
"""adb driver for the physical test device (MIUI blocks input injection into
other apps — tap/text only work if "USB debugging (Security settings)" is on).

Usage:
  python dev-scripts/drive_device.py shot              # screenshot -> .run-screenshot.png (repo root)
  python dev-scripts/drive_device.py fg                # foreground activity
  python dev-scripts/drive_device.py launch            # cold-restart the app (LAUNCHER intent)
  python dev-scripts/drive_device.py deeplink          # connect dev client to Metro (localhost:8081)
  python dev-scripts/drive_device.py reload            # adb reverse + deeplink + wait + shot
  python dev-scripts/drive_device.py logcat            # recent logcat for the app pid
  python dev-scripts/drive_device.py tap X Y
  python dev-scripts/drive_device.py text "some text"
  python dev-scripts/drive_device.py key KEYCODE       # 66=enter, 4=back
"""
import subprocess
import sys
import time
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

DEVICE = "ea23bdb6"
PKG = "com.anonymous.unityfitness"
ROOT = Path(__file__).resolve().parent.parent
SHOT = ROOT / ".run-screenshot.png"
METRO_DEEPLINK = "unityfitness://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081"


def adb(*args, capture=False):
    cmd = ["adb", "-s", DEVICE, *args]
    if capture:
        return subprocess.run(cmd, capture_output=True, text=True, errors="replace").stdout
    return subprocess.run(cmd)


def shot():
    raw = subprocess.run(["adb", "-s", DEVICE, "exec-out", "screencap", "-p"],
                         capture_output=True).stdout
    SHOT.write_bytes(raw)
    print(f"saved {SHOT} ({len(raw)} bytes)")


def deeplink():
    r = adb("shell", "am", "start", "-a", "android.intent.action.VIEW",
            "-d", METRO_DEEPLINK, capture=True)
    print(r.strip())


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    cmd = sys.argv[1]
    if cmd == "shot":
        shot()
    elif cmd == "fg":
        out = adb("shell", "dumpsys", "activity", "activities", capture=True)
        for line in out.splitlines():
            if "mResumedActivity" in line:
                print(line.strip())
                break
    elif cmd == "launch":
        adb("shell", "monkey", "-p", PKG, "-c", "android.intent.category.LAUNCHER", "1",
            capture=True)
        print("launched")
    elif cmd == "deeplink":
        deeplink()
    elif cmd == "reload":
        adb("reverse", "tcp:8081", "tcp:8081", capture=True)
        adb("shell", "am", "force-stop", PKG)
        time.sleep(1)
        # Deep link (not LAUNCHER) — otherwise the dev client falls back to
        # the bare index.android.bundle path, which 404s on expo-router apps.
        deeplink()
        time.sleep(20)
        shot()
    elif cmd == "logcat":
        pid = adb("shell", "pidof", PKG, capture=True).strip()
        print("pid:", pid or "<not running>")
        if pid:
            out = subprocess.run(
                ["adb", "-s", DEVICE, "logcat", "-d", "--pid", pid, "-t", "150"],
                capture_output=True, text=True, errors="replace").stdout
            lines = [l for l in out.splitlines() if l.strip()]
            print("\n".join(lines[-50:]))
    elif cmd == "tap":
        adb("shell", "input", "tap", sys.argv[2], sys.argv[3])
        print(f"tapped {sys.argv[2]} {sys.argv[3]}")
    elif cmd == "text":
        adb("shell", "input", "text", sys.argv[2].replace(" ", "%s"))
        print(f"typed: {sys.argv[2]}")
    elif cmd == "key":
        adb("shell", "input", "keyevent", sys.argv[2])
        print(f"keyevent {sys.argv[2]}")
    else:
        print(__doc__)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
