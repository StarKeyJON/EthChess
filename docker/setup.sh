#!/bin/bash

DOCKER_IMAGE=$(docker ps --filter name=ETH_CHESS -q)

if [ "$1" = "start" ]; then
  # Run Docker container
  # to run the frontend on a different port add the "-e PORT=8080" parameter and change "-p 8080:8080" one.
  [ -z "$DOCKER_IMAGE" ] && docker run \
    --name ETH_CHESS \
    -v `pwd`:/opt/eth_chess \
    -w /opt/eth_chess \
    -p 3000:3000 \
    -p 8080:8080 \
    -p 8545:8545 \
    -dt node:18 || docker restart ETH_CHESS

  docker exec -ti ETH_CHESS bash -c "yarn install"
  docker exec -dt ETH_CHESS bash -c "yarn chain"
  docker exec -dt ETH_CHESS bash -c "yarn server"
  sleep 5
  docker exec -ti ETH_CHESS bash -c "yarn deploy"
  docker exec -dt ETH_CHESS bash -c "yarn start"
else
  if [ "$1" = "deploy" ]; then
    [ -z "$DOCKER_IMAGE" ] && echo "Container does not exist. Run the script with 'start' before running it with the 'deploy' option." \
      || docker exec -ti ETH_CHESS bash -c "yarn deploy"
  else
    echo "Invalid command. Choose 'start' or 'deploy'."
  fi
fi


