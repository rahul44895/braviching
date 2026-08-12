#!/bin/bash
# Single-container entrypoint: brings up MySQL, bootstraps it on first boot, then hands off to
# the Node app. This is a real trade-off vs. running MySQL as its own service -- see README's
# "Deploying to Render" section for why (one crash takes down both, no independent restarts).
set -e

DATADIR=/var/lib/mysql
mkdir -p "$DATADIR"
chown -R mysql:mysql "$DATADIR"

# Clean up stale runtime files from a prior unclean shutdown (e.g. the container was force-killed
# after the shutdown grace period expired -- confirmed happening locally: bash defers running
# EXIT/TERM traps until a foreground child exits, so a long-running `npm run render-start` isn't
# interrupted in time and Docker SIGKILLs the whole container). Without this, mysqld refuses to
# start on the next boot with "Another process ... is using unix socket file" even though nothing
# is actually still running -- it's just reading a leftover lock/pid file.
rm -f /var/run/mysqld/mysqld.sock /var/run/mysqld/mysqld.sock.lock /var/run/mysqld/mysqld.pid

FIRST_BOOT=false
if [ ! -d "$DATADIR/mysql" ]; then
  FIRST_BOOT=true
  echo "[start.sh] No existing MySQL data directory found -- initializing..."
  mysqld --initialize-insecure --datadir="$DATADIR" --user=mysql
fi

echo "[start.sh] Starting MySQL..."
# Render's free instance is 512MB RAM / 0.1 CPU, shared between MySQL and Node -- MySQL's defaults
# alone (128MB InnoDB buffer pool + performance_schema instrumentation + other overhead) can eat
# 300-400MB on their own, leaving too little for Node. These flags trade query/connection
# throughput (irrelevant for a low-traffic demo) for a much smaller baseline footprint.
mysqld --datadir="$DATADIR" --user=mysql \
  --innodb-buffer-pool-size=64M \
  --innodb-log-file-size=16M \
  --performance-schema=OFF \
  --key-buffer-size=8M \
  --table-open-cache=64 \
  --max-connections=20 &
MYSQL_PID=$!

# Make sure MySQL (and the app, once started below) go down with this script (SIGTERM/SIGINT from
# `docker stop`, or on exit) -- without this, mysqld would be silently orphaned since it's not
# PID 1. This only fires promptly because both processes are backgrounded and waited on via `wait`
# (see the bottom of this script) -- bash defers running traps until a *foreground* command
# finishes, which would otherwise mean `docker stop` has to wait out the full grace period and
# force-kill everything instead of shutting down cleanly.
trap 'echo "[start.sh] Shutting down..."; kill "$MYSQL_PID" "$APP_PID" 2>/dev/null; wait 2>/dev/null' EXIT TERM INT

echo "[start.sh] Waiting for MySQL to accept connections..."
until mysqladmin ping --silent 2>/dev/null; do
  sleep 1
done

if [ "$FIRST_BOOT" = true ]; then
  echo "[start.sh] First boot -- setting root password and creating the app database/user..."
  mysql -uroot <<-SQL
    ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';
    CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;
    CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}';
    GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%';
    FLUSH PRIVILEGES;
SQL
fi

echo "[start.sh] Handing off to the Node app (migrate + conditional seed + server)..."
npm run render-start &
APP_PID=$!
wait "$APP_PID"
