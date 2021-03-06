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

## unlink a container from network
```bash
docker network disconnect --force bridge SOME_CONTAINER
```


## docker network

Sometimes when kill a container, docker not automatically disconnect from network or stop listening some ports.
We need to disconnect those container manually

```bash
docker network ls

docker network inspect {network}
```

Now we can see the active containers

disconnect container from network

```bash
docker network disconnect -f {network} {endpoint-name}
docker network rm {network}
```


## display container resource usage
```bash
docker stats --no-stream
```
flags

name | default | description
--- | --- | ---
--all , -a | | Show all containers (default shows just running)
--format	|	| Pretty-print images using a Go template
--no-stream	|	| Disable streaming stats and only pull the first result
--no-trunc	| | Do not truncate output