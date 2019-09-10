# Build snake-skin
FROM node:13-alpine as builder
WORKDIR /snake-skin
COPY ./package.json /snake-skin
COPY ./package-lock.json /snake-skin
RUN npm install
COPY ./ /snake-skin
RUN NODE_ENV=production npm run build
RUN npm prune --production

# Create Snake Skin image
FROM node:13-alpine
WORKDIR /snake-skin
COPY --from=builder /snake-skin/__sapper__ /snake-skin/__sapper__
COPY --from=builder /snake-skin/node_modules /snake-skin/node_modules
COPY --from=builder /snake-skin/static /snake-skin/static
CMD ["nodejs", "__sapper__/build"]
