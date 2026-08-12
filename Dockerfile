# Single container running both the Node API and MySQL. Ubuntu (not Debian) is the base because
# Ubuntu's `mysql-server` package is genuine MySQL 8 -- Debian's default MySQL package resolves to
# MariaDB instead, which we don't want (the local dev setup and everywhere else this was tested
# against is real MySQL 8 via docker-compose).
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Standard Docker trick for apt-installing a service package (mysql-server) without an init system
# present: policy-rc.d exiting 101 tells the package's postinst "don't try to start/manage this
# service yourself", which would otherwise fail or hang during the image build.
RUN printf '#!/bin/sh\nexit 101\n' > /usr/sbin/policy-rc.d && chmod +x /usr/sbin/policy-rc.d

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl gnupg mysql-server \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

COPY deploy/single-container/start.sh /start.sh

# Ubuntu's mysql-server postinst auto-initializes a default data directory during `apt-get
# install` above, even with policy-rc.d blocking the service from actually *starting*. That baked-
# in datadir must be wiped so the image ships genuinely empty at /var/lib/mysql -- otherwise
# start.sh's "is this the first boot" check (does $DATADIR/mysql exist?) finds it already
# initialized and skips creating the app's DB user entirely, which is exactly what happened when
# this was first tested locally.
RUN chmod +x /start.sh \
  && rm -rf /var/lib/mysql/* \
  && mkdir -p /var/lib/mysql \
  && chown -R mysql:mysql /var/lib/mysql

EXPOSE 4000

ENTRYPOINT ["/start.sh"]
