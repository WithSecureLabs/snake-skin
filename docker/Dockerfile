FROM debian:stable as builder
WORKDIR /snake-skin
RUN apt-get update; apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs
COPY ./ ./
RUN rm -Rf ./node_modules/
RUN npm install
RUN npm run build

FROM debian:stable-slim
RUN apt-get update; apt-get install -y nginx; rm -Rf /var/cache/apt; rm -Rf /var/lib/apt
COPY ./nginx/docker.conf /etc/nginx/sites-available/docker.conf
COPY ./docker/entrypoint.sh /entrypoint.sh
COPY --from=builder /snake-skin/dist /var/www/snake-skin
EXPOSE 80
CMD ["/entrypoint.sh"]
