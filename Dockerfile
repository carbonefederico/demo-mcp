# demo-mcp — production image.
#
# Multi-stage: install deps -> compile TS (the tsconfig pins noEmit, so the
# build passes explicit overrides) -> runtime with prod deps + dist only.
# The server binds 0.0.0.0 via app.listen(port) with PORT defaulting to 3000.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN ./node_modules/.bin/tsc -p tsconfig.json --noEmit false --outDir dist --rootDir src

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
