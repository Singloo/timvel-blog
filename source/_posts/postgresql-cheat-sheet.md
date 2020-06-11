---
title: postgresql cheat sheet
date: 2019-8-1 9:42:02 AM
tags:
  - postgresql
cover: https://source.unsplash.com/random/800x500
---

## Backup database
```sql
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
```sql
psql -U username -d database -f /path/to/file
```


## set next sequence id to max id of the table
```sql
-- Get Max ID from table
SELECT MAX(id) FROM table;
-- Get Next ID from table
SELECT nextval('table_id_seq');
-- Set Next ID Value to MAX ID
SELECT setval('table_id_seq', (SELECT MAX(id) FROM table));
```