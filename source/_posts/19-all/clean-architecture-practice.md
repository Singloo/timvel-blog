---
title: Clean architecture实践
date: 2019-8-25 5:21:36 PM
tags:
  - architecture
  - front-end
  - react native
cover: https://source.unsplash.com/random/800x500
---

> 参考
> https://mp.weixin.qq.com/s/Cxx61G0HofOTnwn9f_r5Vg
> https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

> 第二个例子
> https://github.com/Singloo/clean-architecture-demo

> 具体实现,请查看项目`modules`目录下, 有个简单例子
> https://github.com/Singloo/timvel


我最后的文件结构大致如此
- template
	- builder
      - index.tsx
	- interactor
       - index.ts
	- presenter
    	- index.ts
	- stores
    	- index.ts
	- types
    	- index.ts
	- viewModel
        - viewModel.tsx
    	- components
        	- functional.tsx


大概讲下每个文件都做什么

## stores
放基本的数据结构,还有增删改的方法,
这里我用的是`mobx`

## interactor
拥有一个或多个`store`,
放一些复杂的业务逻辑,只更新`store`

## presenter
拥有`interactor`实例,
监听事件,处理ui,关于修改`store`的方法,都从`interactor`里调用.

## viewModel
react component,

拥有`presenter`,从prop接受,
所以ui事件,点击事件都从`presenter`里调用,一些动画属性,可以存在`state`,暴露方法给`presenter`调用.

里面所有的`component`都不应该有state, 只负责展示ui

## builder
react component,

初始化`interactor`,传入`store`, 
初始化`presenter`,传入`interactor`
在render里返回`viewModel`,传入`presenter`


## 说下为什么要分成这几个文件

## store

这里面`store`是很好理解的,存放数据结构,和state类似
这是必须的.

## interactor
`interactor`的话,
其实`store`和`interactor`可以放一起,
但后来想想,还是分开的好,`store`只描述数据结构, 
`interactor`可能会在不同的页面通过不同的逻辑去更新`store`,

如果把所有能更新`store`的逻辑都放一起,项目大了可能看起来会眼花,而且并不是所有逻辑都能复用

有些方法还会用于控制页面的刷新,错误状态.

所以最好还是分开,保持`store`的纯洁性.

`interactor`和`store`,在需要更换框架的时候,是可以直接迁移过去的, 如果都是用的`js`,那基本上复制过去就能用

## presenter

`presenter`是做什么的呢?

我个人觉得,`presenter`是连接ui和逻辑的,所以所有关于逻辑方面的方法,最好都写在`interactor`里,当需要触发一些ui动画, 可以写在`presenter`里

`presenter`还用于监听事件,当其他页面需要触发更新数据的操作时, 最好还是不要直接去修改属于页面的`store`,还是通过event,还通知页面更新

还有像一些处理页面跳转的逻辑, 我觉得应该放在`presenter`里

`presenter`里我还放里`componentDidMount`和`componentWillUnmount`这两个方法, 用于替代`viewModel`的生命周期, 当然也可以改成其他名字.

`presenter`的迁移, 是需要修改一些属于ui框架的方法

## viewModel
纯粹的展示ui, 放一些动画逻辑, 因为我用的是`mobX`,所以在这里和`store`进行连接.

## builder
`builder`的存在是为了让结构更清晰一些吧.


### 个人之前走过的一些弯路
一开始是分成3个文件,
一个放页面component,放一些处理ui点击的方法
一个放一些逻辑,像网络请求之类的
还有一个是放的`store`
一开始用的是`redux`,当时项目结构很差,每个文件的职责不是很清楚.
一旦项目变大, 很多一开始打算复用的逻辑也找不到了, 都是重新写.
component的文件也变得十分臃肿.

后来用了`mobx`
项目还是3个文件,

但是各个文件的职能清楚了一点,

一个放component,处理点击事件

一个放store,和修改`store`的方法

一个放各种网络请求.

但是写到后面又变得十分混乱....

当时想了半天, 终于发现, 用于展示页面的react component文件一定不能放逻辑,
然后又加了个文件, 把逻辑部分剥离了出来.

后来看到携程的文章, 一开始没看懂.... 尴尬, 看了几十遍, 觉得这可能是目前比较好的架构吧.

出于编程可扩展性考虑, 自然是把一个页面分得越细越好.

但是还有两点需要考虑
- 分的越细, 开发时写的代码就越多
- 各个文件的职能到底是什么?

`clean architecture` 把一个module分成了5个文件(`typescript`多一个type), 每个文件都有比较明确的职能, 易于测试和框架的迁移. 这也是我觉得它比较好的原因吧...

一个页面创建这么多文件是比较麻烦的, 所以我写了个script,用于快速的创建module

我觉得我可能讲的也不是很清楚, 所以准备了一个例子,见文章开头

具体如何,建议查看携程的文章, 里面讲的很细,还有很多图片
虽然我也是看了很多遍才懂....





