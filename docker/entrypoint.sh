#!/bin/bash

if [ $SNAKE_ADDRESS ] && [ $SNAKE_PORT ]; then
  sed -i "s/SNAKE/$SNAKE_ADDRESS:$SNAKE_PORT/" -i /etc/nginx/sites-available/docker.conf
else
  echo "Please pass values for SNAKE_ADDRESS and SNAKE_PORT"
  exit 1
fi

exec /usr/sbin/nginx -c /etc/nginx/sites-available/docker.conf
