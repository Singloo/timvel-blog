---
title: 修bug时的思考过程
date: 2022-1-2 11:01:32 AM
tags:
  - code
	- fe
cover: https://images.unsplash.com/photo-1638401985728-4570ea56992b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0NTI1NXwwfDF8cmFuZG9tfHx8fHx8fHx8MTY0MTA5MjQ5NA&ixlib=rb-1.2.1&q=80&w=1080
---

> **有效期: *12* 个月**  *[什么是有效期?](https://blog.timvel.com/2020/12/28/12-28-2020-a-description-of-the-validity-period/)*


> 很久不写技术类的文章了,因为很多时候不知道写什么,如果写一些库的应用和示例代码,我会觉得太简单,这种东西看文档就行了,虽然有时候我也会搜类似的文章.  
但是太深奥的东西我也写不出,怕误人子弟.思来想去还是写写思考过程吧, 事实上我很想知道别人的思考过程, 但类似的文章总是很少.  
前几天在b站看了个视频,大致是揭穿网上热门永动机视频,视频中作者就展示了他的思考过程,我觉得很好,因为我也会思考他为什么会这么想,他具备的哪些知识让他能作出这样的推理.


打算试下flutter, 初始化了一个项目, 前几天都在看文档, 之前都是从xcode跑的项目, 今天突然发现xcode跑的项目没法hot reload. 于是试下flutter run, 结果报错.

先看错误信息, 没有, 只提示失败, `verbose`, 提示`ld unknown option: -target`. 复制错误信息, 加上`flutter`, google, 没什么相关的结果, 然后百度, 依旧没结果.

搜索 `flutter run ios failed`, 没有相关结果.   
猜测可能是跟xcode或者模拟器版本相关, ios降一个版本, 失败. 搜索`flutter xcode 13`没有相关结果.  
之前好像瞟到`annaconda`, 也试了下`conda deactivate`,依旧无效.  

ok, 那现在的情况就是网上没有相关解决办法, 必须自己解决了.  
再看下错误, `unknown option`,是某个调用`ld`时`-target`这个option无效, 在log里搜`-target`,找到了这行代码, 用的是`/usr/bin/ld`, 确实用到了`-target`.  

打开terminal, 查看`ld`版本, 查看`ld -h`,报错,但提示了查看文档的方法, 继续查看, 搜了下, 没有`target`.  

现在知道了,是`ld`这个库的原因, 网上搜下这行错误, 没有信息. 搜下`/usr/bin/ld`, 找到了一些相关文章, 了解到这是`gcc`的一个包.  

terminal查下gcc版本, 4.9, 网上搜下gcc最新版本, 10. ok, 那可能就是gcc的问题了. 用`homebrew`安装最新的gcc, 为避免对其他xcode,apple服务造成破坏, 用`alias gcc = 'gcc-10'`测试, clean下缓存, 运行`flutter run`,成功了.   

到这里bug修完了,是因为gcc版本造成的问题, xcode一向用的gcc4, 好像之前也遭遇过类似的问题.
