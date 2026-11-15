"""Educational SQLite example, not an agent runtime or a delivery service.

Run: python3 always-on-inbox.py
Uses only the standard library and a fresh temporary directory per execution.
One worker, one input event, deterministic output; no network or model calls.
The exception models failure between two writes, not a process/power failure.
"""

import sqlite3
import tempfile
from contextlib import closing
from pathlib import Path


class SimulatedFailure(Exception):
    pass


def run_once(path, atomic, fail=False):
    with closing(sqlite3.connect(path)) as db:
        with db:
            event = db.execute("SELECT id FROM inbox WHERE done = 0").fetchone()
            if event is None:
                return
            db.execute("INSERT INTO outbox(event_id) VALUES (?)", event)
            if not atomic:
                db.commit()  # Deliberately broken: output saved on its own.
            if fail:
                raise SimulatedFailure("between output and completion")
            db.execute("UPDATE inbox SET done = 1 WHERE id = ?", event)


def snapshot(path):
    with closing(sqlite3.connect(path)) as db:
        return (
            db.execute("SELECT COUNT(*) FROM inbox").fetchone()[0],
            db.execute("SELECT SUM(done) FROM inbox").fetchone()[0],
            db.execute("SELECT COUNT(*) FROM outbox").fetchone()[0],
        )


def demo(folder, atomic):
    label = "atomic" if atomic else "split"
    path = folder / (label + ".sqlite3")
    with closing(sqlite3.connect(path)) as db:
        db.executescript(
            "CREATE TABLE inbox(id TEXT PRIMARY KEY, done INTEGER NOT NULL);"
            "CREATE TABLE outbox(event_id TEXT NOT NULL);"
        )
        with db:
            for _ in range(2):
                db.execute("INSERT OR IGNORE INTO inbox VALUES ('event-1', 0)")
    assert snapshot(path) == (1, 0, 0)
    print(f"{label}: duplicate input -> inbox=1")
    try:
        run_once(path, atomic, fail=True)
    except SimulatedFailure:
        pass
    else:
        raise AssertionError("failure injection did not run")
    after_failure = snapshot(path)
    assert after_failure == (1, 0, 0 if atomic else 1)
    print(f"{label}: after failure -> done={after_failure[1]}, outbox={after_failure[2]}")
    run_once(path, atomic)  # Reopens the same file with a new connection.
    run_once(path, atomic)  # A completed event must not be handled again.
    result = snapshot(path)
    assert result == (1, 1, 1 if atomic else 2)
    print(f"{label}: after retry -> done={result[1]}, outbox={result[2]}")
    return result[2] == 1


if __name__ == "__main__":
    with tempfile.TemporaryDirectory(prefix="always-on-demo-") as directory:
        folder = Path(directory)
        assert demo(folder, atomic=False) is False
        assert demo(folder, atomic=True) is True
    print("PASS: split writes duplicate output; atomic writes keep one queued output")
