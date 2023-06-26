# Build snake-skin
FROM node:lts-alpine as builder
RUN apk add g++ make python3
WORKDIR /snake-skin
COPY ./package.json /snake-skin
COPY ./package-lock.json /snake-skin
RUN npm install
COPY ./ /snake-skin
RUN NODE_ENV=production npm run build
#RUN npm prune --production

# Create Snake Skin image
FROM node:lts-alpine
WORKDIR /snake-skin
COPY --from=builder /snake-skin/__sapper__ /snake-skin/__sapper__
COPY --from=builder /snake-skin/node_modules /snake-skin/node_modules
COPY --from=builder /snake-skin/static /snake-skin/static
CMD ["node", "__sapper__/build"]
