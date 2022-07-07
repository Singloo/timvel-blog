---
title: 你妈的apscheduler
date: 2022-7-7 10:11:15 PM
tags:
  - python
cover: https://images.unsplash.com/photo-1656602330155-d06ed19ad7bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0NTI1NXwwfDF8cmFuZG9tfHx8fHx8fHx8MTY1NzIwMzA3NQ&ixlib=rb-1.2.1&q=80&w=1080
---

> **有效期: _12_ 个月** _[什么是有效期?](https://blog.timvel.com/2020/12/28/12-28-2020-a-description-of-the-validity-period/)_

官方的教程是这么写的

￼<img 
    src='/img/2022/07/01.png'
    width=500/>  

综合了下其他人的教程, 大差不差吧  
￼<img 
    src='/img/2022/07/02.png'
    width=500/>  
￼
数据库里看不到数据, 但能看见 index 是增长的, 我还以为是高科技呢, 有办法不让用户看见数据  

￼<img 
    src='/img/2022/07/03.png'
    width=500/>  

但是重启服务 job 没有恢复, 说明确实没有保存到数据库. 最后搜了半天, 原来要这么写才有用  

￼<img 
    src='/img/2022/07/04.png'
    width=500/>  

￼<img 
    src='/img/2022/07/05.png'
    width=500/>  
￼
这是官方文档所有提到 add_jobstore 的地方, 一个介绍如何添加 custom store, 剩下的都是 api  

￼<img 
    src='/img/2022/07/06.png'
    width=500/>

￼<img 
    src='/img/2022/07/07.png'
    width=500/>  
￼

嗯, 最后终于有数据了. 一时间不知道说什么好, 感觉像是某种法术, 必须按一定姿势使出才能有用.  
明明是开源的, 想给别人用的, 但又不想让别人好好用
