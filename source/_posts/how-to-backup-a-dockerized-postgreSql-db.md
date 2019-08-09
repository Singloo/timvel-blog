---
title: How to backup a dockerized postgreSql db
date: 2019-8-1 9:27:27 AM
tags:
  - postgresql
  - docker
  - rxjs
  - typescript
  - nodeJs
cover: https://source.unsplash.com/random/800x500
---

This article will show you how to backup a postgres db and upload backups to a storage service.
<br/>I use postgreSql and Aliyun OSS as my storage service.

This article includes

- postgresql (only one line of code, pg_dump ....)
- some shell script
- dockerfile
- docker run
- typescript
- nodeJs
- rxjs

I will try to explain each line of code.
<br/>All the code is designed to minimize implementation requirements.

Find code here

- https://github.com/Singloo/dockerfiles
- https://github.com/Singloo/upload-backups-to-aliyun-oss

## Let's start with Dockerfile

> I referred to some github repositories

This is the whole Dockerfile

```dockerfile
FROM postgres:alpine

ADD install.sh install.sh

RUN sh install.sh && rm install.sh

ENV POSTGRES_DB **None**
ENV POSTGRES_DB_FILE **None**
ENV POSTGRES_HOST **None**
ENV POSTGRES_PORT 5432
ENV POSTGRES_USER **None**
ENV POSTGRES_PASSWORD **None**
ENV POSTGRES_EXTRA_OPTS '-Z9'
ENV SCHEDULE '@daily'
ENV BACKUP_DIR '/backups'
ENV BACKUP_KEEP_DAYS 7
ENV BACKUP_KEEP_WEEKS 4
ENV BACKUP_KEEP_MONTHS 6



VOLUME /backups

ADD backup.sh /backup.sh
RUN chmod a+x /backup.sh
ENTRYPOINT ["/bin/sh", "-c"]
CMD ["exec /usr/local/bin/go-cron -s \"$SCHEDULE\" -- /backup.sh"]
```

`FROM postgres:alpine`
<br/>this image is built on top of postgres:alpine

`ADD install.sh install.sh`
<br/>add `install.sh` to image

`RUN sh install.sh && rm install.sh`
<br /> run `install.sh` and delete `install.sh`

let see what happens in `install.sh`

```bash
#! /bin/sh

set -e

apk update

apk add curl ca-certificates

curl -L https://github.com/odise/go-cron/releases/download/v0.0.7/go-cron-linux.gz | zcat > /usr/local/bin/go-cron

chmod a+x /usr/local/bin/go-cron

apk add --update nodejs npm

apk del ca-certificates

rm -rf /var/cache/apk/*
```

`#! /bin/sh`
<br/>choose which `shell` to use

`set -e`
<br/>exit if and error occurs

`apk update`
<br/>`apk add curl ca-certificates`
<br/>update apk, and install `curl ca-certificates`
~~I guess ca-certificates is not so important?~~

`curl -L https://github.com/odise/go-cron/releases/download/v0.0.7/go-cron-linux.gz | zcat > /usr/local/bin/go-cron`
<br/> download and decompress `go-cron` to `/usr/local/bin/go-cron`

`chmod a+x /usr/local/bin/go-cron`
<br/> everyone can excute `/usr/local/bin/go-cron`

`apk add --update nodejs npm`
<br/>similarly

`apk del ca-certificates`
<br/>`rm -rf /var/cache/apk/*`
<br/>delete ca... and delete this directory

go back to the Dockerfile

```
ENV POSTGRES_DB **None**
ENV POSTGRES_DB_FILE **None**
ENV POSTGRES_HOST **None**
ENV POSTGRES_PORT 5432
ENV POSTGRES_USER **None**
ENV POSTGRES_PASSWORD **None**
ENV POSTGRES_EXTRA_OPTS '-Z9'
ENV SCHEDULE '@daily'
ENV BACKUP_DIR '/backups'
ENV BACKUP_KEEP_DAYS 7
ENV BACKUP_KEEP_WEEKS 4
ENV BACKUP_KEEP_MONTHS 6
```

define some environment variables

`VOLUME /backups`
<br/>`volume` is used to persisting data and share data between containers. Here is not necessary to define a `volume`,(~~I guess~~) I'll use `volume` later in the `docker run`

`ADD backup.sh /backup.sh`
<br/>`RUN chmod a+x /backup.sh`
<br/>~~about code in `backup.sh`, I'll explain later.~~
<br/>add executable permissions to everyone, this is important. At least in my server, before I adding this command, I got permission denied error.

<br/>`ENTRYPOINT ["/bin/sh", "-c"]`
<br/>`CMD ["exec /usr/local/bin/go-cron -s \"$SCHEDULE\" -- /backup.sh"]`
<br/>excute command after container mount, use `go-cron` to run as cron job.

`backup.sh`

```bash
#! /bin/sh
set -e

if [ "${POSTGRES_DB}" = "**None**" ]
then
  echo "You need to set the POSTGRES_DB environment variable."
  exit 1
fi

if [ "${POSTGRES_HOST}" = "**None**" ]
then
  if [ -n "${POSTGRES_PORT_5432_TCP_ADDR}" ]
  then
    POSTGRES_HOST=${POSTGRES_PORT_5432_TCP_ADDR}
    POSTGRES_PORT=${POSTGRES_PORT_5432_TCP_PORT}
  else
    echo "You need to set the POSTGRES_HOST environment variable."
    exit 1
  fi
fi

if [ "${POSTGRES_USER}" = "**None**" ]; then
  echo "You need to set the POSTGRES_USER environment variable."
  exit 1
fi

if [ "${POSTGRES_PASSWORD}" = "**None**" ]; then
  echo "You need to set the POSTGRES_PASSWORD environment variable or link to a container named POSTGRES."
  exit 1
fi

#Process vars
if [ "${POSTGRES_DB_FILE}" = "**None**" ]; then
  POSTGRES_DBS=$(echo "${POSTGRES_DB}" | tr , " ")
elif [ -r "${POSTGRES_DB_FILE}" ]; then
  POSTGRES_DBS=$(cat "${POSTGRES_DB_FILE}")
else
  echo "Missing POSTGRES_DB_FILE file."
  exit 1
fi
export PGUSER="${POSTGRES_USER}"

export PGPASSWORD="${POSTGRES_PASSWORD}"

POSTGRES_HOST_OPTS="-h ${POSTGRES_HOST} -p ${POSTGRES_PORT} ${POSTGRES_EXTRA_OPTS}"
KEEP_DAYS=${BACKUP_KEEP_DAYS}
KEEP_WEEKS=`expr $(((${BACKUP_KEEP_WEEKS} * 7) + 1))`
KEEP_MONTHS=`expr $(((${BACKUP_KEEP_MONTHS} * 31) + 1))`

#Initialize dirs
mkdir -p "${BACKUP_DIR}/daily/" "${BACKUP_DIR}/weekly/" "${BACKUP_DIR}/monthly/"

#Loop all databases
for DB in ${POSTGRES_DBS}; do
  #Initialize filename vers
  DFILE="${BACKUP_DIR}/daily/${DB}-`date +%Y%m%d-%H%M%S`.sql.gz"
  #Create dump
  echo "Creating dump of ${DB} database from ${POSTGRES_HOST}..."
  pg_dump -f "${DFILE}" ${POSTGRES_HOST_OPTS} ${DB}
  #Clean old files
  echo "Cleaning older than ${KEEP_DAYS} days for ${DB} database from ${POSTGRES_HOST}..."
  find "${BACKUP_DIR}/daily" -maxdepth 1 -mtime +${KEEP_DAYS} -name "${DB}-*.sql*" -exec rm -rf '{}' ';'
done

echo "SQL backup uploaded successfully"
```

<br/> about this `backup.sh`, I referrd to other developers' code. The first part is checking if those environment variables exist.
The most important line of code is
<br/>`pg_dump -f path/to/file -U username -h 0.0.0.0 -p 5432`
<br/>`PGUSER` equal to `-U username`
<br/>export `PGPASSWORD` is to avoid inputting password

### The docker run command is 
`docker run -d --env-file ./backup.list -v /apps/backups:/backups --restart always --name pg-backup meanless/postgres-backup `

`-d` run the container in the background
<br/>`--env-file` use environment variables from a file
<br/>`-v` bind `/apps/backups` to `/backups`, so that we can visit backups in `/apps/backups`
<br/>`--restart always` literally, always restart container, if container exits
<br/>`--name` give this container a name


## Upload backups

Well, you can upload backups in any way you like.
<br/> Personally, I prefer `rxjs` and `nodeJs`

```typescript
import path from 'path';
import fs from 'fs-extra';
import { from, range, of, throwError, empty } from 'rxjs';
import {
  switchMap,
  mergeMap,
  concatMap,
  map,
  pluck,
  tap,
  retryWhen,
  delay,
  mapTo,
  toArray,
} from 'rxjs/operators';
import OSS from 'ali-oss';
// init OSS client
const client = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
  timeout: process.env.OSS_TIMEOUT || 60 * 1000 * 20,
});

const BACKUP_DIR = process.env.BACKUP_DIR;
if (!BACKUP_DIR) {
  console.log("'BACKUP_DIR' is not defined in the env list");
}

// record error
const recordError = (error: any) => {
  fs.appendFile(
    path.join(__dirname, './error.log'),
    `${new Date()}, ${error.message}`,
  )
    .catch(err => {
      console.log(err.message);
    });
};
// get size of file
const getFileSize = (filepath: string) => {
  return from(fs.stat(filepath)).pipe(
    map(stat => ({
      bytes: stat.size,
      mbSize: +(stat.size / 1000000).toFixed(2),
    })),
  );
};
// split a large file into multiple parts
const getBatch = (totalBytes: number, batchSize: number = 2000000) => {
  const cnt = Math.floor(totalBytes / batchSize);
  const arr = new Array(cnt).fill(batchSize, 0).map((batchSize, index) => ({
    index,
    start: index * batchSize,
    end: (index + 1) * batchSize,
  }));
  if (totalBytes % batchSize > 0) {
    arr.push({
      index: cnt,
      start: cnt * batchSize,
      end: totalBytes,
    });
  }
  return arr;
};
// if there is an error, wait for some time and try again
const $retryWhenDelay = (delayTime = 100, times = 1) =>
  retryWhen(err =>
    err.pipe(
      delay(delayTime),
      concatMap((error, index) =>
        index < times ? of(null) : throwError(error),
      ),
    ),
  );
const multipartUpload = (filepath: string, filename?: string) => {
  if (!filename) filename = path.basename(filepath);
      // init OSS muliple parts upload
  return from(client.initMultipartUpload(filename)).pipe(
      // switch to another observable
    switchMap(result => {
      // get size of file, convert to multiple parts, each part is 2mb
      return getFileSize(filepath).pipe(
        switchMap(({ bytes, mbSize }) => {
          const batches = getBatch(bytes);
          console.log(filename, 'total size', bytes, 'batches', batches.length);
          if (batches.length === 0) return empty();
          // this batches is an array, use from(array), convert an array into a single value
          return from(batches);
        }),
        // do something to this single value
        map(item => ({
          ...item,
          uploadId: result.uploadId,
        })),
      );
    }),
    // process each part one by one
    concatMap(({ index, start, end, uploadId }) => {
      console.log(filename, 'Task start', 'part', index + 1, start, end);
      // upload each part
      return from(
        client.uploadPart(filename, uploadId, index + 1, filepath, start, end),
      ).pipe(
        map(part => ({
          etag: part.etag,
          number: index + 1,
          uploadId,
        })),
        tap(() => {
          console.log(filename, 'Task done', 'part', index + 1);
        }),
      );
    }),
    // after finishing all the parts, collect all value, convert single value into an array
    toArray(),
    map(parts => ({
      parts: parts.map(o => ({
        etag: o.etag,
        number: o.number,
      })),
      uploadId: parts[0].uploadId,
      filename,
    })),
  );
};

const run = () => {
  // read all files from the directory
  from(fs.readdir(BACKUP_DIR))
    .pipe(
      tap(filenames => console.log('file count', filenames.length)),
      switchMap(filenames =>
      // convert array into single value
        from(filenames).pipe(
          map(filename => ({
            filename,
            filepath: path.join(BACKUP_DIR, filename),
          })),
        ),
      ),
      // process each file one by one
      concatMap(({ filepath, filename }) =>
        multipartUpload(filepath, filename).pipe(
          switchMap(({ filename, parts, uploadId }) => {
            console.log(uploadId, parts);
            return client.completeMultipartUpload(filename, uploadId, parts);
          }),
          // map value to filepath
          mapTo(filepath),
        ),
      ),
      // delete file
      mergeMap(filepath => from(fs.unlink(filepath)).pipe(mapTo(filepath))),
      tap(filepath => console.log(path.basename(filepath), 'delete success')),
    )
    .subscribe({
      next: () => {},
      error: err => {
        console.log(err.message);
        recordError(err);
      },
      complete: () => console.log('COMPLETE'),
    });
};
```

docker run command
<br/>`docker run -d --env-file ./upload-backups.list -v /apps/backups:/backups -v /apps/upload-backups:/apps/upload-backups -w /apps/upload-backups --restart always --name upload-backups node:latest npm run start `

<br/>`-w` means, when this container mount, go into this directory. That's how I understand it, for more detail, please read official doc.

That's it.