---
title: 关于rxjs-1
date: 2019-02-25 22:55:33
tags:
  - rxjs
  - functional programming
cover: https://source.unsplash.com/random/800x500
---

在使用toast的时候,可能会出现一种情况,一个toast刚出现,另一个toast就发出了,
在之前的逻辑中,第一个toast会被顶掉,
但是我想在第一个toast时间结束后,第二个才出现,

这个逻辑,在我的项目中有实现过, 用的 `redux-observable`

翻了下代码,嗯....实在是平庸啊

```javascript
 action$.pipe(
    ofType('SHOW_SNAKE_BAR'),
    concatMap(({ payload }) =>
      Observable.create(observer => {
        const {
          type = 'NORMAL',
          content,
          duration = 2000,
          immediate = false,
          onPress = null,
        } = payload;
        observer.next(
          dispatch('SNAKE_BAR_SET_STATE', {
            ...payload,
          }),
        );
        setTimeout(() => {
          observer.next(dispatch('SNAKE_BAR_RESET_STATE'));
          observer.complete();
        }, duration + 300);
      }),
    ),
  );
```

实现这个逻辑, `concatMap` 是必须的?,这个操作符会在一个 `observable` 结束后,才会发出下一个value

所以,似乎用 `Observable.create` 是最简单的方法,提供的 `observer` 可以很简单的控制发出的值和结束的时间

但是,我个人是非常避免使用 `Observable.create` 来创建, 可能是因为太简单? 或者,根本没有一点
`functional programming` 的感觉了

新项目使用的是 `mobX` , `action` 并不是一个 `observable`

好像不是很重要,可以先用个array,模拟下连续的toast
```javascript
let startTime = Date.now();
const diff = () => (Date.now() - startTime) / 1000;
from(data)
  .pipe(
    concatMap(d => of(d).pipe(delay(d.duration))),
    tap(d => {
      console.log('d.duration: ', d.duration, diff());
      startTime = Date.now();
    }),
  )
  .subscribe(() => {});
```
#### log
```bash
d.duration:  2000 2.01
d.duration:  1500 1.505
d.duration:  3000 3.006
d.duration:  2000 2.002
d.duration:  1000 1.001
```
这样的话,第一个value也会延迟发出,显然是不符合要求的 ~~我会犯这种错误?~~

修改如下

```javascript
let startTime = Date.now();
const diff = () => (Date.now() - startTime) / 1000;
from(data)
  .pipe(
    concatMap(d =>
      timer(d.duration).pipe(
        mapTo(null),
        startWith(d),
      ),
    ),
    filter(o => o !== null),
    tap(d => {
      console.log('d.duration: ', d.duration, diff());
      startTime = Date.now();
    }),
  )
  .subscribe(() => {});
```

这样好像对了? 
`startWith` 会立刻发出第一个值, 然后在经过时间n后,发出 `null` ,再用 `filter` 忽略掉 `null`

```javascript
const toast$ = new Subject();
const toasts = [];
toast$
  .pipe(
    concatMap(_ => {
      const toast = toasts.shift();
      return timer(toast.duration).pipe(
        mapTo(null),
        startWith(toast),
      );
    }),
    filter(toast => {
      if (toast === null && toasts.length === 0) {
        //dismiss toast...
      }
      return toast !== null;
    }),
    tap(d => {
      console.log('d.duration: ', d.duration, diff());
      startTime = Date.now();
    }),
  )
  .subscribe(() => {});
```
说实话,我喜欢用箭头函数直接返回值, 用 return 来返回....我不是很喜欢

#### 模拟连续发出toast

```javascript
interval(100)
  .pipe(
    take(data.length),
    map(value => data[value]),
  )
  .subscribe(o => {
    toasts.push(o);
    toast$.next(null);
  });
```
感觉好像还是不够简洁?

使用到的 `operators` 和 `observable` 如下
`of`, `timer`, `from`, `Subject`, `interval`

`concatMap`, `filter`, `startWith`, `tap`, `delay`, `mapTo`,`take`, `map`, `switchMap`,