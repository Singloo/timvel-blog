---
title: python之怪
date: 2020-7-10 8:14:53 PM
tags:
  - python
cover: https://source.unsplash.com/random/800x500
---

今天改了下爬虫, 我有几个服务器, 今天发现新加坡的那几台服务器ip经常被ban, 国内的服务器没有问题
看来网站对外网ip有限制, 于是我打算稍微改一下爬虫, 如果是外国服务器, 则在初始化的时候就设置下proxy

很简单的功能, 甚至没有测试代码就直接部署了.
但是我在看log的时候,突然发现国内的服务器也在初始化的时候就设置proxy. 起初我以为, 只是环境变量打错了
不是什么大问题, 稍微修改了下, 又直接部署了, 结果问题还在.

于是我在`class`的`init`方法里打印了下`变量`, 没有输出.

我把更改的`变量`的方法给注释掉. `变量`默认是`False`, 这样应该就没问题了吧?
结果还是在初始化的时候设置了proxy.

这时发生的事情就有点打破我的认知了. 我全局搜索了下代码, 我并没有在其他地方更改这个`变量`, 那么初始化是`False`的变量为什么在使用时变成了`True`?

期初我以为, 出于某些原因, 所有类型为`boolean`的`变量`都变成了`True`, 于是我同时打印了另一个`boolean`类型... 结果是`False True`

这就奇了他妈的怪了, 我开始考虑一些不科学的原因, 是不是变量名太长了? 或者要加`__`的前缀? 我在试验这些可能时, 报了另一个错误, `XXclass不包含 XXX变量` ...

此时此刻, 我所有的编程常识都不起作用了, 我甚至开始想, 是不是因为有`4`个变量? `4`这个数字不吉利? 我注释掉了一个变量, 结果依旧...

最后搜了下[可能的原因]('https://github.com/rq/rq/issues/582')... 发现作者是这样解释的

> We use Python's pickle to serialize data into Redis and pickle can't realiably pickle instance method. I suggest rewriting your function so that it doesn't take instance method as parameter.


嗯.... 到头来, 是因为使用pickle带来的不确定性. 我突然想到, 我爬虫所有的代码都是基于class的, 甚至还有继承, 使用`变量`也是常有的事. 而在过去的时间里... 居然能正常运行...

在调研python message queue的时候,我就发现了一个奇怪的问题, 多数库都使用了pickle, 在发送消息的时候, 就需要把所调用的方法传进去, 反而在worker消费消息的时候, 不需要做太多事, 但作者仍要求, 代码的目录结构要和保持一致.

而在js中并不是这样, 发送消息的时候,只用一个唯一的string来标记类型, worker再根据这个string分别处理. 这种模式对我而言是合理且正常的. 我相信这种模式也应该能在python下实现...

至于为何众多`message queue`的库选择用pickle, 可能是因为`pickle`是python独有的吧... 但是代价呢? 甚至作者都说不清哪种情况下pickle会失效.

当然我只是刚入门python, 也是个人牢骚, 没有意义.


