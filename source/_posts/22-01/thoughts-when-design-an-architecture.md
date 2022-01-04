---
title: 设计一个前端架构时的思考过程
date: 2022-1-3 5:27:09 PM
tags:
  - code
	- fe
cover: https://images.unsplash.com/photo-1639378117397-96c5e9d4cc66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0NTI1NXwwfDF8cmFuZG9tfHx8fHx8fHx8MTY0MTIwMjAzMQ&ixlib=rb-1.2.1&q=80&w=1080
---

> **有效期: *12* 个月**  *[什么是有效期?](https://blog.timvel.com/2020/12/28/12-28-2020-a-description-of-the-validity-period/)*

一个前端App可以看成是数据,业务逻辑,和UI的组成. 将其命名为`Store`,`Service`,`View`,名字总是不重要的,什么model,presenter,viewmodel都无所谓.  

如果任何一个`Service`可以获取任何`Store`, 并且可以调用任何其他`Service`. 那大概是不会有问题的, `View`应该只作为对数据的反应.  

为什么实际业务中, 会存在`Service`复用难的问题? 不管是为了项目的可扩展性, 还是为了团队合作, 代码的整洁性, 对各个模块之间的独立性总是提出了要求, 因此需要解决独立性下的逻辑复用问题.

那么对那些方面有独立性要求? `Module A`的数据被`Module B`读取有影响吗? 没有. 但是直接对数据的修改则容易造成意料之外的影响. 因此对跨`Module`的数据修改应禁止.  

`Service`的复用? 分情况, 若是不涉及数据修改的方法调用, 则随意. 对涉及数据修改的方法应加以限制或谨慎调用.

---

#### 是否应该将`Service`分成2部分, 一种涉及`Store`,另一种不涉及?
> 不应该作区分, 实际业务的复杂度在于, 永远不知道以后会把代码改成什么样, 可能在某一时刻一些方法需要调用`Store`了, 这时候在把方法移来移去很是麻烦, 如果不移动,又破坏了当初的约定.
---
#### `Store`如何初始化?
> 一些长时间需要的`Store`可以在一开始就建立, 并且保存在全局, 一些则可以在需要使用到的时候实例化.
---
#### 具体的描述下跨`Module`调用
> 1. 涉及获取其他`Store`, 直接调用
> 2. 涉及修改其他`Store`, 通过`Module`所属`Service`调用
> 3. 不涉及`Store`修改的`Service`方法, 直接调用
> 4. 与`View`相关的调用, 比如,与`View`的生命周期相关, 在某个`Module A`打开后15秒调用`Module B`的方法, 在某个`Module A`关闭时调用`Module B`方法. 此类调用是在`View`存在时发起,应由`Controller`控制, 通过`Event`的形式, `Module B`也应在`Controller`处监听事件. 以往`Event`难以获取返回的参数或者进行错误处理, 可通过`Rx`库进行改造.
---
#### 描述下`Controller`
> `Controller`因`View`而存在, 用于链接`View`和`Service`. 同时也负责在`View`的生命周期内监听事件, 调用`Service`.  
> e.g.一个Counter的例子, `View`中有个Button, 点击事件调用`Controller.onPressButton`,`Controller`调用`Service.increaseCounter`,`Service`中调用`Store.increase`,`Store`修改count,`View`接收到count变化,更新页面.
---
#### 描述下`Service`
> `Service`是一个`Module`所有业务逻辑的集合, 持有这个`Module`的`Store`, 也可以有全局`Service`. 如果业务逻辑过于复杂,可以将`Service`进行拆分.  
`Service`可以访问任何`Store`, 任何其他`Service`, 但涉及对其他`Store`的修改, 则应通过调用其他`Service`实现.  
对于与`View`绑定的event调用, `Service`可以主动发起, 若是处理event调用, 则只实现逻辑, 由`Controller`负责监听.

---
#### 既然`Service`之间可以随意调用, 为什么还要强调属于某个`Module`, 而不直接分离出来, 变成全局?
> 为避免随着业务增长, 逻辑混乱, 导致新增业务写在这个`Service`中可以, 那个`Service`中也行. 与`Module`绑定是为了使所有发生在这个`Module`中的新增业务逻辑, 都写在这个`Service`中. 尽管`Service`之间可随意调用.  
当然全局`Service`和`Store`也可以存在.

---
#### 为什么和`View`特性有关的(比如生命周期)调用要通过`Event`发起?
> `View A`如果通过调用`Controller A.Service A`,然后在`Service A`中调用`Service B.XXX`, 那么这种调用是确定的, 一定会发生的, 并且`View A`是期待调用是成功的.   
> 但事实上, 这种调用属于,`View B`委托`View A`发出调用, `View A`不应受后续调用影响,也不关心调用结果. 因此event调用也更具灵活性, 考虑到团队沟通的不实时性,`View B`也可以在不需要时主动放弃监听event. 而`View A`可以延后放弃发出event.
---
#### 描述几个跨`Module`调用的例子.  
> 1. `View A`需要使用`View B`的`Store`  
在`View A`中直接使用

> 2. `Service A`需要使用`Store B`  
直接使用

> 3. `Service A`需要使用`Service B`  
直接使用

> 4. `Service A`需要修改`Store B`  
调用`Service B`的方法

> 5. `Service A`需要在`View B`关闭时执行一些方法  
`Controller A`: listen('view B did close', `Service A.handler`)  
`View B`的生命周期函数中: `Controller B.service B.onViewClose`: triggerEvent('view B did close')

--- 
#### 描述下初始化过程
> `Store`先初始化  
> `View`初始化时, `Controller`也初始化, 传入`Module`所属`Service`, `Service`初始化, 传入可修改控制的`Store`.

---
#### `Service A`调用`Service B`, 但`View B`未初始化, 全局不存在`Store B`
> 初始化一个新的`Store B`, 初始化`Service B`, 传入`Store B`. 此时应知道, `View B`不存在, 即使调用的某些方法修改了`Store B`, 也不会有任何UI发生变化. 如果是提前获取数据, 然后初始化`View B`, 则自行做相应处理. 
---
#### 特殊情况, 如何调用一些只属于`View`的方法? 比如某些框架的动画
> 用Delegate, 或者封装一个class,把`View`传进去,再把class的instance依次传给`Controller`,`Service`,在`Service`中调用. 调用时应做空处理, 只有存在时才进行调用, 不存在则跳过, 不应影响其他逻辑.
--- 
### 一些示例图片
<img src=/img/2022/1/archi.png width=400/>

--- 
<img src=/img/2022/1/example1.png width=400/>

---
<img src=/img/2022/1/example2.png width=400/>

## DEPRECATED
~~如果app只有单个页面, 问题总是简单的, 为避免文件过长,自然而然的可以想到把一个页面分成3部分`View`, `Controller`,`Model`.~~  
~~但是实际情况总是复杂的. 考虑到页面间的交互, 一些逻辑的复用, 在这里先定义4个部分, `View`, `Controller`, `Service`, `Store`. 拥有这4个部分的实体叫做`Module`. 一个`Module`具备自己的状态, 有一些自己的服务/逻辑/方法(名字随意), 可能会需要调用其他`Module`的方法, 可能会被其他`Module`调用方法.~~

~~从下至上讲起.~~  
### ~~`Store`~~
~~`Store`包含了页面所有的数据, 当然你也可以叫State, Data, Model, 名字总是无所谓的.  
`Store`还包含了一些修改这些数据的方法. 但这些方法必须是同步的. 任何通过api请求,数据库才能得到的数据都不应该放在`Store`里.~~

### ~~`Service`~~
~~所有`Module`用到的,或者向其他`Module`提供的业务逻辑.如果逻辑过多,可分成多个.  
`Service`持有`Store`.~~ 

### ~~`Controller`~~
~~用于链接`View`和`Service`, 还用于处理其他`Module`发起的`Service`逻辑复用请求. 持有`Service`~~

### ~~`View`~~
~~描述页面, 以及一些属于框架的特殊代码, 比如: 动画.  
监听`Store`, 不同的框架有不同的实现方法.~~

~~上层依次持有下层, 并保持对下层的屏蔽.~~

~~接下来以QA的方式回答这个结构中的一些问题, 同时也是我个人的思考过程.~~  

#### ~~为什么api请求, 数据库请求不放在`Store`里? 它们不也属于对数据增删改的操作吗?~~  
> ~~1. 这些异步请求存在版本更替的可能.~~

> ~~2. `Store`应该是存粹的,不会报错的数据操作. 若需要对`Store`内的逻辑也进行错误处理,则逻辑过于混乱. 本结构中所有的异步都应该发生在`Service`中.~~

#### ~~如果`Service`需要调用`View`的方法怎么办?比如一些动画~~
> ~~在某些UI框架下, 可能难以避免的会有一些方法需要在`View`中调用, 这时候可以采用一些类似Delegate的方法实现, 或者写个class,把`View`传进去,在里面实现功能后,再将这个class传给`Controller`,`Service`,总之避免直接传`View`.~~


#### ~~`Controller`和`Service`具体区分~~

> ~~举一个counter的例子,   
`Store`拥有属性`count`,方法`increment`.  
</br> 
`Service`,也有一个`increment`,但是调用`store.increment`.   
</br> 
`Controller`也有个`increment`,调用`service.increment`.   
</br> 
`View`有个`Button`, 点击时调用`controller.increment`  
</br>
这是个最简单的例子,并且我将他们的方法都取了同一个名字,大家可以感受到这种情况下,很多存在都显得多余.~~  


#### ~~如何解释以上例子多余的内容?~~

> ~~首先大家可以发挥下写论文时的本领, `Controller`更多的是描述`View`的行为, 可以命名为`onPressButton`,   `Service`的名字更倾向于描述方法的功能, 可以命名为`increaseCount`.   
可能某些情况下, 确实是`Controller`写了个多余的方法调用`Service`的方法, 但是`Controller`还承担了`Module`之间的逻辑复用. 同时`Controller`只有一个, `Service`可视复杂度进行拆分.~~

#### ~~`Module`之间如何复用逻辑?~~
~~通过event调用, 在`Controller`处注册, 由`Service`发出请求, event模式一般难以获得调用结果, 可以通过rx改造成observer解决这一问题.~~

~~但是存在的问题是, `Controller`伴随页面而初始化, 如果页面未打开,或者关闭后,其`Service`就无法继续被调用.~~   

~~因此方案有问题,需重新思考.~~