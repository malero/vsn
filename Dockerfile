ARG GO_VERSION=1.25.0
ARG NODE_VERSION=22

# Build the VSN browser runtime from the locked Node dependencies.
FROM node:${NODE_VERSION}-bookworm-slim AS frontend
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY tsconfig.json tsup.config.ts ./
COPY src ./src
RUN npm run build

# Documentation, templates, and site assets are embedded in the Go binary.
FROM golang:${GO_VERSION}-bookworm AS builder
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download && go mod verify
COPY site ./site
RUN CGO_ENABLED=0 go build -trimpath -o /out/vsn-site ./site

# Example fragments and JavaScript bundles are read from the repository root.
FROM debian:bookworm-slim AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /out/vsn-site /usr/local/bin/vsn-site
COPY --from=frontend /build/dist ./dist
COPY examples ./examples
USER 65532:65532
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/vsn-site"]
CMD ["-addr", "0.0.0.0:8080", "-root", "/app"]
