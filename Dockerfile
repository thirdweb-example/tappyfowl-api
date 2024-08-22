# Create base stage using ubuntu:22.04
FROM node:20.13.1-bookworm-slim AS base
# Set the default working directory in all future containers
WORKDIR /app
# Set the timezone in ENV to use localized timestamps
ENV TZ="America/Chicago"
# Update the container's apt repository cache, install required packages, clean
# apt cache and remove all temporary files in one layer to reduce image size
RUN apt-get update && \
    apt-get install -y libsecret-1-dev tzdata dos2unix dumb-init ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/{apt,dpkg,cache,log}/ /var/tmp/* /tmp/*

FROM base AS intermediate
COPY package.json package-lock.json tsconfig.json /app/
RUN npm i --omit=dev

FROM intermediate AS builder
COPY src/ /app/src
RUN npm i && npm run build

FROM intermediate
ENV RELAYER_PRIVATE_KEY="" \
    REDIS_URL="redis://localhost:6379"
COPY --chown=node:node --from=builder /app/dist/server.js /app/server.js
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "/app/server.js"]
