---
title: 使用rxjs来处理一群promise
date: 2019-3-5 12:39:43 PM
tags:
  - rxjs
  - functional programming
cover: https://source.unsplash.com/random/800x500
---

`array`里有一堆`promise`,这种情况用 js 的话,也不是不可以可以处理
`map`数组, 返回`promise`, 然后使用`Promise.all`,这样写,还算优雅
但是数据的顺序无法保证

如果对`promise`的顺序有要求的话, 需使用`for`循环
我个人及其讨厌`for`循环, 可能这也是我不怎么喜欢 python 的原因

好了,下面介绍如何使用 rxjs 来优雅的处理 promise

首先生成一堆`promise`

```javascript
const randomNumber = (n, m) => {
  const c = m - n + 1;
  return parseInt(Math.random() * c + n, 10);
};
const proms = n =>
  new Promise(resolve =>
    setTimeout(() => {
      resolve(n);
    }, randomNumber(100, 300)),
  );

const promises = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((_, index) =>
  proms(index),
);
```

####使用 rxjs 简单处理

```javascript
from(promises)
  .pipe(
    mergeMap(p=>from(p)),
    tap(x => console.log(x)),
  )
  .subscribe(() => {});
```
很简单是吧, `from`会把一个数组的值,一个个发出,如果不太熟练的同学, 可以使用`mergeMap`,
把接收到的value, 转换成另一个 `Observable`, 你可以这样写 `mergeMap(p=>from(p))` ,
似乎更好理解一些, 但其实这个`from`是可以省略的,
 `mergeMap(p=>p)`, 意思是, 接收到`promise`, 转换监听的对象, 监听这个 `promise` 发出的值

但是,`mergeMap`,是比较多余的, 因为我们的数组本身是由`observable`组成,
所以,只需收集所有发出的值
```javascript
from(promises)
  .pipe(
    mergeAll(),
    tap(x => console.log(x)),
  )
  .subscribe(() => {});
```

还可以更简单....
```javascript
merge(...promises)
  .pipe(
    tap(x => console.log(x)),
  )
  .subscribe(() => {});
```
使用了`merge`的话, 最后的结果就是无序的了,
如果你想要按照顺序,可以使用`concatMap`, 这里我就直接写最简单的了...`concatMap`怎么用...都是一样的
```javascript
concat(...promises)
  .pipe(
    tap(x => console.log(x)),
  )
  .subscribe(() => {});
```

那么问题来了, 有些时候,希望传进去的是数组,最后接收的也是数组,怎么办呢?
`toArray`
```javascript
concat(...promises)
  .pipe(
    toArray(),
    tap(x => console.log(x)),
  )
  .subscribe(() => {});
```
...so easy, rxjs真是个美好的东西
本次使用到的`observable`和`operators`有

`from`,`mergeMap`,`merge`,`mergeAll`,`concat`,`concatMap`,`toArray`


~~对不起我不知道我在说什么...我没讲清楚,看不懂就算了吧...~~