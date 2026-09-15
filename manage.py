#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import json
import os
import sys
import time

# #region agent log
_DEBUG_LOG = "/home/travis-prol/Documents/projects/roster-pulse/.cursor/debug-2ecd72.log"


def _agent_log(hypothesis_id, location, message, data=None):
    try:
        with open(_DEBUG_LOG, "a", encoding="utf-8") as handle:
            handle.write(
                json.dumps(
                    {
                        "sessionId": "2ecd72",
                        "runId": "run1",
                        "hypothesisId": hypothesis_id,
                        "location": location,
                        "message": message,
                        "data": data or {},
                        "timestamp": int(time.time() * 1000),
                    }
                )
                + "\n"
            )
    except Exception:
        pass


# #endregion


def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    # #region agent log
    _agent_log(
        "E",
        "manage.py:main",
        "manage.py entered",
        {
            "pid": os.getpid(),
            "run_main": os.environ.get("RUN_MAIN"),
            "argv": sys.argv,
            "env_host": os.environ.get("POSTGRES_HOST"),
            "env_port": os.environ.get("POSTGRES_PORT"),
            "env_name": os.environ.get("POSTGRES_DB"),
        },
    )
    # #endregion
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    # #region agent log
    if len(sys.argv) > 1 and sys.argv[1] == "runserver":
        from django.core.management.base import BaseCommand
        from django.core.management.commands.runserver import Command as RunserverCommand
        import django.core.management.commands.runserver as runserver_mod

        _orig_check = BaseCommand.check_migrations
        _orig_inner = RunserverCommand.inner_run
        _orig_wsgi_run = runserver_mod.run

        def _check_migrations(self, *args, **kwargs):
            from django.db import connection

            _agent_log(
                "C",
                "BaseCommand.check_migrations",
                "before check_migrations",
                {"pid": os.getpid(), "run_main": os.environ.get("RUN_MAIN")},
            )
            started = time.time()
            try:
                import socket

                from django.conf import settings as dj_settings

                db_host = dj_settings.DATABASES["default"]["HOST"]
                db_port = int(dj_settings.DATABASES["default"]["PORT"])
                probe = {"host": db_host, "port": db_port}
                sock = socket.socket()
                sock.settimeout(2)
                tcp_started = time.time()
                try:
                    sock.connect((db_host, db_port))
                    probe["tcp_ok"] = True
                    probe["tcp_s"] = round(time.time() - tcp_started, 3)
                    sock.send(b"\x00\x00\x00\x08\x04\xd2\x16/")
                    try:
                        reply = sock.recv(16)
                        probe["ssl_reply_len"] = len(reply)
                    except Exception as exc:
                        probe["ssl_recv_error"] = type(exc).__name__
                except Exception as exc:
                    probe["tcp_ok"] = False
                    probe["tcp_error"] = type(exc).__name__
                finally:
                    sock.close()
                _agent_log(
                    "F",
                    "BaseCommand.check_migrations",
                    "tcp vs postgres handshake",
                    probe,
                )
                _agent_log(
                    "B",
                    "BaseCommand.check_migrations",
                    "before select 1",
                    {"pid": os.getpid()},
                )
                connection.ensure_connection()
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    one = cursor.fetchone()[0]
                    cursor.execute(
                        "SELECT wait_event_type, wait_event, state "
                        "FROM pg_stat_activity WHERE datname = current_database()"
                    )
                    activity = [
                        {"wait_event_type": row[0], "wait_event": row[1], "state": row[2]}
                        for row in cursor.fetchall()
                    ]
                _agent_log(
                    "B",
                    "BaseCommand.check_migrations",
                    "after select 1",
                    {
                        "select1": one,
                        "elapsed_s": round(time.time() - started, 3),
                        "backends": activity,
                    },
                )
                result = _orig_check(self, *args, **kwargs)
            except Exception as err:
                _agent_log(
                    "C",
                    "BaseCommand.check_migrations",
                    "check_migrations failed",
                    {
                        "error": type(err).__name__,
                        "detail": str(err)[:200],
                        "elapsed_s": round(time.time() - started, 3),
                    },
                )
                raise
            _agent_log(
                "C",
                "BaseCommand.check_migrations",
                "after check_migrations",
                {"elapsed_s": round(time.time() - started, 3)},
            )
            return result

        def _inner_run(self, *args, **options):
            _agent_log(
                "D",
                "RunserverCommand.inner_run",
                "inner_run start",
                {"pid": os.getpid(), "run_main": os.environ.get("RUN_MAIN")},
            )
            return _orig_inner(self, *args, **options)

        def _wsgi_run(addr, port, wsgi_handler, **kwargs):
            _agent_log(
                "D",
                "runserver.run",
                "before wsgi bind/serve",
                {"addr": addr, "port": str(port), "ipv6": kwargs.get("ipv6")},
            )
            return _orig_wsgi_run(addr, port, wsgi_handler, **kwargs)

        BaseCommand.check_migrations = _check_migrations
        RunserverCommand.inner_run = _inner_run
        runserver_mod.run = _wsgi_run
        _agent_log(
            "B",
            "manage.py:main",
            "runserver hooks installed",
            {"pid": os.getpid(), "run_main": os.environ.get("RUN_MAIN")},
        )
    # #endregion
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
