---
title: linux cheat sheet
date: 2019-7-17 12:36:28 PM
tags:
  - linux
cover: https://source.unsplash.com/random/800x500
---

## Download file from linux server
```bash
scp root@xx.xxx.xxx:/path/to/server /path/to/local
```

download a directory from linux server
```bash
scp -r root@xx.xxx.xxx:/path/to/server /path/to/local
```

## Upload file to linux server
```
scp /path/to/file root@xx.xxx.xx:/path/to/server
```

## See size of file
```bash
ls -lh [path/to/file]
```
>output
```bash
drwxr-xr-x   1 root root 4.0K Aug 10  2018 bin
drwxr-xr-x   2 root root 4.0K Jun 26  2018 boot
drwxr-xr-x   5 root root  340 Jun 14 06:24 dev
drwxr-xr-x   1 root root 4.0K Aug 17  2018 docker-entrypoint-initdb.d
lrwxrwxrwx   1 root root   34 Aug 10  2018 docker-entrypoint.sh -> usr/local/bin/docker-entrypoint.sh
-rw-r--r--   1 root root 204K Aug  1 01:36 dump_01-08-2019_01_36_22.sql
drwxr-xr-x   1 root root 4.0K Sep  8  2018 etc
drwxr-xr-x   2 root root 4.0K Jun 26  2018 home
drwxr-xr-x   1 root root 4.0K Jul 16  2018 lib
drwxr-xr-x   2 root root 4.0K Jul 16  2018 lib64
drwxr-xr-x   2 root root 4.0K Jul 16  2018 media
drwxr-xr-x   2 root root 4.0K Jul 16  2018 mnt
drwxr-xr-x   2 root root 4.0K Jul 16  2018 opt
dr-xr-xr-x 131 root root    0 Jun 14 06:24 proc
drwx------   1 root root 4.0K Jul 27  2018 root
drwxr-xr-x   1 root root 4.0K Aug 10  2018 run
drwxr-xr-x   1 root root 4.0K Aug 10  2018 sbin
drwxr-xr-x   2 root root 4.0K Jul 16  2018 srv
dr-xr-xr-x  13 root root    0 Aug  1 01:37 sys
drwxrwxrwt   1 root root 4.0K Aug  1 01:35 tmp
drwxr-xr-x   1 root root 4.0K Jul 16  2018 usr
drwxr-xr-x   1 root root 4.0K Jul 16  2018 var
```


## See size of directory
```bash
du -h path/to/directory
```
>output
```bash
8.0K	dev/shm
0	dev/mqueue
0	dev/pts
8.0K	dev
```

## shell flags -c -n -x
`-n` Check that your script has valid syntax without executing it

`-x` Watch every command in your script as it is executed

`-c` If the -c option is present, then commands are read from string.
<br/>If there are arguments after the string, they are assigned to the positional parameters, starting with $0.

## reload sshd service
> sudo service sshd reload
> sudo service ### command

## as root user
> sudo -i / sudo su -i

## set password for root
> sudo passwd root

## check size of folder
> du -h --max-depth=1

## check server time
> date -R

## change timezone
> tzselect
> cp /usr/share/zoneinfo/Asia/Shanghai  /etc/localtime