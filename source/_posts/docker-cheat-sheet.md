---
title: docker cheat sheet
date: 2019-8-1 9:46:21 AM
tags:
  - docker
cover: https://source.unsplash.com/random/800x500
---

## docker-compose

try to use docker-compose rather than docker run
Here is an example
```yml
version: "3"

services:

  node_server:
    image: node:latest
    ports: 
      - "8080:8080"
    volumes: 
      - .:/apps/timvel-server
    restart: always
    working_dir: /apps/timvel-server
    networks:
      backend:
        aliases:
          - main_node
    env_file: 
      - ./env.list
    logging:
      driver: "json-file"
      options:
        max-size: "200k"
        max-file: "10"
    command: ["npm","run","start"]
    
networks:
  backend:

```