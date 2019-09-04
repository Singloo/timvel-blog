---
title: postgresql cheat sheet
date: 2019-8-1 9:42:02 AM
tags:
  - postgresql
cover: https://source.unsplash.com/random/800x500
---

## Backup database
```
pg_dump -f path/to/file -U username -h 0.0.0.0 -p 5432
```
or define environment variables 

`PGUSER` equal to `-U username`

`PGPASSWORD` avoid inputting password


## Clean up querys that take too long and stuck database

see querys take more than 5 minutes
```sql
SELECT
pid,
now() - pg_stat_activity.query_start AS duration,
query,
state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

terminate query
```
SELECT pg_terminate_backend(pid)
```

## restore db from .sql file
```
psql -U username -d database -f /path/to/file
```