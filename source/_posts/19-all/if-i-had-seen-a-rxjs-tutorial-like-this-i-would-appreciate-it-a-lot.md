---
title: 如果当初我能看到这样的rxjs教程, 我一定会感激不尽
date: 2019-7-30 8:46:17 AM
tags:
  - rxjs
cover: https://source.unsplash.com/random/800x500
---

我尽量少用文字描述,希望读者能够把代码跑一下,看看结果,说不定能悟到什么.
我不会去说`reactive programming`,`functional programming`,这些无聊的概念.

### 第一步, 搞清楚什么时候返回`observable`, 什么时候返回一个普通的值

#### 先创建几个辅助方法, 在接下来会使用到

```javascript
const TAP = (x = 'TAP') => tap(n => console.log(x, n));

const randomNumber = (n, m) => {
  const c = m - n + 1;
  return Math.floor(Math.random() * c + n);
};
const normalPromise = (v, time) =>
  new Promise(resolve =>
    setTimeout(() => resolve(v), time || randomNumber(800, 2000)),
  );
const normalCurryingPromise = (v, time) => () =>
  new Promise(resolve =>
    setTimeout(() => resolve(v), time || randomNumber(800, 1500)),
  );
const normalRejectPromise = (v, time) =>
  new Promise((resolve, reject) =>
    setTimeout(() => reject(v), time || randomNumber(800, 1500)),
  );
const normalCurryingRejectPromise = (v, time) => () =>
  new Promise((resolve, reject) =>
    setTimeout(() => reject(v), time || randomNumber(800, 1500)),
  );

const LOG = log => (...logs) => console.log(log, ...logs);
let START;
const LOG_TIME = (...logs) => {
  if (!START) {
    START = Date.now();
    console.log('start', ...logs);
  } else {
    console.log(((Date.now() - START) / 1000).toFixed(2) + 's ', ...logs);
  }
};

const SUBSCRIBE = (next, complete, error) => ({
  next: next || LOG('NEXT'),
  error: error || LOG('ERROR'),
  complete:
    complete ||
    function() {
      console.log('COMPLETE');
    },
});
```

#### 了解`of`和`from`, 这是常用的两个用于创建`observable`的操作符

```javascript
const arr = [1, 2, 3, 4, 5];
const proms1 = normalPromise('foo');

of(arr).subscribe(SUBSCRIBE()); // NEXT [ 1, 2, 3, 4, 5 ]

from(arr).subscribe(SUBSCRIBE()); // NEXT 1 NEXT 2 NEXT 3 NEXT 4 NEXT 5

of(proms1).subscribe(SUBSCRIBE()); // NEXT Promise { <pending> }

from(proms1).subscribe(SUBSCRIBE()); // NEXT foo

of(1).subscribe(SUBSCRIBE()); // NEXT 1

from(1).subscribe(SUBSCRIBE());
// 这里会出错
// You provided '1' where a stream was expected. You can provide an Observable, Promise, Array, or Iterable
```

好了, 到此为止,你应该清楚`from`,`of`接受怎样的输入,会输出什么, 你还可以试试输入一个`string`会怎样

### 第二步, 了解`map`,`switchMap`,`mergeMap`,`concatMap`

```javascript
const arr = [1, 2, 3, 4, 5];
from(arr)
  .pipe(map(x => x * 2))
  .subscribe(SUBSCRIBE());
// NEXT 2
// NEXT 4
// NEXT 6
// NEXT 8
// NEXT 10

from(arr)
  .pipe(switchMap(x => x * 2))
  .subscribe(SUBSCRIBE());
// 这里会报错
//  You provided '2' where a stream was expected. You can provide an Observable, Promise, Array, or Iterable.
```

`switchMap`,`mergeMap`,`concatMap` 这 3 个`operator`必须返回一个`observable`
可以创建`observable`的`operator`有上文提到的`of`,`from`
其他的可以在这里查看, https://www.learnrxjs.io/operators/creation/
我不希望一开始介绍太多的`operator`, 你可以点进连接,看看这些`operator`接受怎样的输入, 会输出怎样的值

所以,要使`switchMap`,起作用

```javascript
from(arr)
  .pipe(switchMap(x => of(x * 2)))
  .subscribe(SUBSCRIBE());

// NEXT 2
// NEXT 4
// NEXT 6
// NEXT 8
// NEXT 10
```

当然,这里你使用`mergeMap`,`concatMap`也会得到同样的结果

#### 三者区别

```javascript
LOG_TIME();
from(arr)
  .pipe(switchMap(x => normalPromise(x, 1000)))
  .subscribe(SUBSCRIBE(LOG_TIME));
//start
// 1.01s  5
// COMPLETE
```

```javascript
LOG_TIME();
from(arr)
  .pipe(concatMap(x => normalPromise(x, 1000)))
  .subscribe(SUBSCRIBE(LOG_TIME));
// start
// 1.01s  1
// 2.01s  2
// 3.01s  3
// 4.01s  4
// 5.01s  5
// COMPLETE
```

```javascript
LOG_TIME();
from(arr)
  .pipe(mergeMap(x => normalPromise(x, 1000)))
  .subscribe(SUBSCRIBE(LOG_TIME));
// start
// 1.01s  1
// 1.01s  2
// 1.01s  3
// 1.01s  4
// 1.01s  5
// COMPLETE
```
有没有悟到点什么? 还需要我过多解释吗?
`switchMap`, 监听最新的`observable`的值, 如果当前`observable`还没发出值, 而下一个`observable`已经到来
那就转而监听下一个`observable`, 永远监听最新的`observable`

`concatMap`, 按顺序监听`observable`的值, 只有在当前`observable`已经完成的情况下, 才会去监听下一个`observable`

`mergeMap`, 监听所有的`observable`, 这个很好理解

以下几个例子,希望可以帮助读者更好的理解, 当然最好的,还是你跑一跑你想验证的

```javascript
LOG_TIME();
from(arr)
  .pipe(mergeMap(x => [x, x]))
  .subscribe(SUBSCRIBE(LOG_TIME));

LOG_TIME();
from(
  arr.map(x =>
    x === 1 ? normalRejectPromise(x, 1000) : normalPromise(x, 1000),
  ),
)
  .pipe(switchMap(x => x))
  .subscribe(SUBSCRIBE(LOG_TIME));

LOG_TIME();
from(arr)
  .pipe(
    switchMap(x =>
      x === 2 ? normalRejectPromise(x, 1000) : normalPromise(x, 1000),
    ),
  )
  .subscribe(SUBSCRIBE(LOG_TIME));

LOG_TIME();
from(arr)
  .pipe(
    mergeMap(x =>
      x === 2 ? normalRejectPromise(x, 1000) : normalPromise(x, 1000),
    ),
  )
  .subscribe(SUBSCRIBE(LOG_TIME));

LOG_TIME();
from(arr)
  .pipe(
    concatMap(x =>
      x === 2 ? normalRejectPromise(x, 1000) : normalPromise(x, 1000),
    ),
  )
  .subscribe(SUBSCRIBE(LOG_TIME));
```

### 第三步, 我觉得到此为止, 各位读者应该理解 rxjs 了, 虽然我只谈到 6 个 `operator`

接下来我会写几个例子, 解释下发生了什么, 这里会提到一些新的`operator`,
但是更多的`operator`,还请查阅官方文档, 或者第三方文档

`forkJoin`是一个常用的`operator`,它会等到输入的`observable`都完成后,返回各个`observable`最后发出的值
```javascript
const arrOfPromises = [
  normalPromise('1'),
  normalPromise('2'),
  normalPromise('3'),
  normalPromise('4'),
];

forkJoin(arrOfPromises).subscribe(SUBSCRIBE());
//NEXT [ '1', '2', '3', '4' ]
```

```javascript
forkJoin([
  interval(100).pipe(take(3)),
  timer(2000),
  normalPromise(1, 1000),
]).subscribe(SUBSCRIBE());
// or
forkJoin(
  //这里`take`指, 只取前3个值, 不然interval永远不会完成
  ...[interval(100).pipe(take(3)), timer(2000), normalPromise(1, 1000)],
).subscribe(SUBSCRIBE());
//NEXT [ 2, 0, 1 ]
```


`race`, promise 也有`race`,这就比较好理解了,只取最先发出的值

```javascript
race([normalPromise(1, 1000), normalPromise(2, 500)]).subscribe(SUBSCRIBE());
//NEXT 2
```

下面给的一些例子, 都是我平时写的一些 script, 代码是肯定跑不了的,我会解释下每一步做了什么,
希望各位能够在这些例子中顿悟
当然我这边的例子嵌套还是有点深的,毕竟写的也比较快,二来,也没有见过什么优秀的例子.

#### 第一个

```javascript
let skip = 0;
//跑28次, 从0开始, 当然我不用这个数字,所以无论从多少开始都无所谓
range(0, 28)
  .pipe(
    // concatMap, 这28次,每次都等前一次跑完才跑下一次
    concatMap(_ =>
      // queryUser 返回一个array, 不必关心这个object的结构
      from(queryUser(skip)).pipe(
        // tap 里面可以执行一些side effect, 返回的值不会影响
        tap(datas => (skip += datas.length)),
        // Array<object>
        // 这里把array, 转成一个个的值, 你应该知道from(Array)会发生什么
        switchMap(datas => from(datas)),
        // object
        // map, 你也应该知道map会做哪些事
        map(data => data.toJSON()),
        map(data => ({
          user_id: data.edid,
          is_teacher: data.is_teacher,
          username: data.username,
          email: data.email,
          headimgurl: data.headimgurl,
          phone_number: data.mobilePhoneNumber,
          language: data.country,
          goal: data.goal,
        })),
        // bufferCount, 取100个值, 转成array, 这里主要为了控制并发,每次处理100个数据
        bufferCount(100),
        // Array<object>
        // concatMap, 当前面100个数据处理完后,才会处理后面的
        concatMap(datas =>
          // 这里把array转成单个数据
          from(datas).pipe(
            // object
            // mergeMap, 同时处理这100个数据
            mergeMap(data =>
              // forkJoin, 等着3个promise处理完成后,同时返回数据,这3个promise都返回的object,不必在意里面的数据结构
              forkJoin(
                from(queryFirstLesson(data.user_id)),
                from(queryPaymentsTimes(data.user_id)),
                from(queryZhUserInfo(data.user_id)),
              ).pipe(
                // Array<object>
                // 将返回的数据,连同上面的object,变成1个object
                map(d =>
                  d.reduce(
                    (acc, curr) => ({
                      ...acc,
                      ...curr,
                    }),
                    data,
                  ),
                ),
              ),
            ),
            // object
            // tap...print一下数据
            tap(data => console.log(data.user_id, 'data got')),
            // mergeMap 执行下一个promise, 不关心先后,
            mergeMap(data => insertIntoHubSpot(data)),
          ),
        ),
      ),
    ),
    // 如果出错, catch, 不停止整个流程, 返回错误,因为我不在next里对数据进行处理
    catchError(err => {
      return of('err', err);
    }),
  )
  .subscribe(SUBSCRIBE());
```

#### 第二个

这个比较简单,里面包含数据库结构.... 就不写清楚了...
反正只需要记住这个是 promise,返回一些数据

```javascript
from(
  db_production.query(
    `
    select
    columns
    from sometable
    where id in (?)
    `,
    {
      replacements: [ids],
    },
  ),
)
  .pipe(
    map(dbResultMap),
    map(rows => rows.map(o => o.lesson_ids)),
    map(ids => ids.flat()),
    map(ids => ids.map(o => +o)),
    map(ids => uniq(ids)),
    // Array<number>
    //从promise中获取一些数据, 这个promise只有一个next, 所以我使用swicthMap
    //如果你的observable会有多个next, 那你需要注意, 如果你使用switchMap, 会出现前一个observable还未发出数据
    //而下一个next已经到来的情况, 这时候前面一个observable会被顶掉
    //你需要考虑,你只想要最新的一个值, 还是需要所有的值不在乎顺序, 还是希望这些值一个个的,按顺序发出
    switchMap(ids =>
      db_production.query(
        `
        select
        columns
        from sometable
        where id in (?)
        `,
        {
          replacements: [ids],
        },
      ),
    ),
    map(dbResultMap),
    // Array<object>
    // 同样的,把array变成一个个的值发出
    switchMap(data => from(data)),
    // object
    // filter,这是第一次出现, 只有返回true的值会发出
    filter(o => /video|audio/.test(o.lesson_type)),
    // buffer, 并发控制, 一次处理5个, 我怕把数据库搞挂掉, 还是温柔点好
    bufferCount(5),
    // Array<object>
    // concat, 等前面5个处理完, 才继续处理下面5个
    concatMap(datas =>
      // merge, 这里的merge,相当于 from(datas).pipe(
      //   mergeMap(data=>somePromise(data))
      // )
      merge(
        ...datas.map(({ id }) =>
          db_production.query(
            `
          update sometable
          set
          modules = ?
          where id = ?
          `,
            {
              replacements: [JSON.stringify([...someData]), id],
            },
          ),
        ),
      ),
    ),
  )
  .subscribe(x => console.log(x));
```

#### 第三个
我发现我写的脚本结构都差不多....
事实上,在实际应用中,常用的`operator`也就那么几个, 像`zip`之类的,根本没机会使用

```javascript
from(
  db_production.query(
    `
        select
         columns
        from sometable
        where id in (?)
        `,
    {
      replacements: [COURSER_IDS],
    },
  ),
)
  .pipe(
    map(dbResultMap),
    map(rows => rows.map(o => o.lesson_ids).flat()),
    //你应该懂了吧
    switchMap(lesson_ids =>
      db_production.query(
        `
      select
      columns
      from sometable
      where id in (?)
      `,
        {
          replacements: [lesson_ids],
        },
      ),
    ),
    map(dbResultMap),
    //这里也应该懂了吧
    switchMap(lessons => from(lessons)),
    //filter也没什么好说的吧
    filter(({ production }) => {
      const keys = Object.keys(production);
      return (
        keys.filter(o => /^a\d+$/.test(o)).length > 0 &&
        keys.filter(o => /^a\d+$/.test(o)).length ===
          keys.filter(o => /^q\d+$/.test(o)).length
      );
    }),
    //toArray() 捕获所有的值, 把他们变成array
    toArray(),
    map(lessons => {
      return lessons
        .map(({ id, production }) => {
          const qs = Object.keys(production).filter(key => MATCH_Q.test(key));
          return qs.map(q => {
            const a = Object.keys(production)
              .filter(key => MATCH_A.test(key))
              .find(key => {
                const num = q.match(MATCH_Q)[0];
                const reg = MATCH_QA_WITH_NUM(num);
                if (!key.match(reg)) return false;
                return key.match(reg)[0] == num;
              });
            return {
              question: production[q],
              keywords: production[a],
              lesson_id: id,
            };
          });
        })
        .flat();
    }),
    tap(lesson => console.log('total task', lesson.length)),
    switchMap(lessons => from(lessons)),
    bufferCount(5),
    //注意, 这里是有问题的,不应该返回<promise>[] 我会在下面解释
    map(questions =>
      questions.map(({ lesson_id, question, keywords }) =>
        db_production.query(
          `
        insert into table
        values(?,?,?)
        `,
          {
            replacements: [lesson_id, question, JSON.stringify(keywords)],
          },
        ),
      ),
    ),
    concatMap(proms => merge(...proms).pipe(toArray())),
    tap(questions => console.log(questions.length, 'done')),
  )
  .subscribe({
    error: err => console.log(err),
    complete: () => console.log('complete'),
  });
```

### 最后,提示一下常见的错误
~~~至少是我曾经犯过的错误~~~

在你希望控制并发, 或者希望按顺序发出值的时候, 
一定不要提前把`promise`给调用了....如果是其他`observable`,自然无所谓

这些都是错误的,
```javascript
const arr = [];
for (let i = 0; i < 50; i++) {
  arr.push(normalPromise(i));
}
LOG_TIME('start');
from(arr)
  .pipe(concatMap(x => x))
  .subscribe({
    complete: () => LOG_TIME('end'),
  });

LOG_TIME('start');
range(0, 50)
  .pipe(
    map(x => normalPromise(x)),
    concatMap(x => x),
  )
  .subscribe({
    complete: () => LOG_TIME('end'),
  });

LOG_TIME('start');
range(0, 50)
  .pipe(
    map(x => normalPromise(x)),
    mergeAll(5),
  )
  .subscribe({
    complete: () => LOG_TIME('end'),
  });
```
如果你大多数使用rxjs的场景是处理promise, 那么也只是使用`map`,`swichMap`,`mergeMap`,`concatMap`,`from`...而已
无非是嵌套的有多深,pipeline有多长罢了
其他的`operator`,都可以自己去跑一跑,看看会发生什么,输出这样的值
这也一直是我的学习方法,写一写代码,看看跑出来的结果是什么

祝各位好运
