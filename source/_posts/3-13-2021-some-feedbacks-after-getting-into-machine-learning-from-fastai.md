---
title: 从fastai入门机器学习后的一点反馈
date: 2021-3-13 3:48:24 PM
tags:
  - ML
  - DL
  - ZH-EN
cover: https://images.unsplash.com/photo-1614348531618-82d0648c5f16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw0NTI1NXwwfDF8cmFuZG9tfHx8fHx8fHx8MTYxNTYyMTcwNg&ixlib=rb-1.2.1&q=80&w=1080
---

> **有效期: *8* 个月**  *[什么是有效期?](https://blog.timvel.com/2020/12/28/12-28-2020-a-description-of-the-validity-period/)*

第一次接触fastai大概是两年前, 但是到2021年, 才刚刚入门. fastai宣传它的课程的时候, 宣称不需要Phd, 不需要编程基础, 不需要懂数学. 8节课, 0基础, 入门深度学习, 掌握地球上最前沿的技术(之一). 看似很美好, 当然, 如果真这么好, 我也不至于两年后才堪堪入门.

我是先接触的是course v3, 总共8节课, 上到5,6节课的时候我已经完全不懂了. 先说说v3课程的不足吧, 第一节课, 做一个模型分辨猫狗, 相当简单, 代码也很少, 遇到不懂得地方Jeffery会跟你说不用管, 后面会解释. 前几节课都是以这种模式, 极少的代码, 非常棒的结果, 不需要理解后面会解释的过程, 介绍的目前深度学习擅长的几种应用. 然后突然之间, 从介绍原理开始, 难度陡增, 如果一个视频不懂, 后面的课程完全无法继续. 而对于一个连Python都不熟悉的人来说, 每一行代码就需要深究, 更要命的是Jeffery通常用很多种方式来实现一个功能, 可能他希望展示不同的写法, 但对于初学者来说是很困惑的.

2020年出了v4版本, 同时也推出了一本书fastbook. 这一次的学习曲线平缓了很多, 不再是想尽可能的包括很多应用, 而是聚焦于3个常见的应用,Image classifier, Tabular, NLP. 同时教学方法也有所改进, 从最简单的模型开始, 然后对于训练过程中的问题, 一点点的提出解决方案, 把通用的调参方法一个个介绍, 应用, 查看结果. 之后也对fastai的api做了从零开始的实现. 当然视频课程依旧只有8节, 更多的内容还是需要去看fastbook. 视频也是参照fastbook, 看不看由个人决定, 我觉得看书完全够了.

那么学完这个课程能得到什么? Jeremy经常提到一些优秀的学生怎么怎么牛逼, 但我想更多的可能没法完成这个课程, 也可能学完已经对深度学习一无所知. 而对于一些普通的学生, 比如我, 在第一遍学完后, 我了解各个调优方法的功能, 并且知道怎么使用他们. 了解如何训练一个模型, 在数据没有问题的情况下, 可以用通用的模型训练出state-of-the-art的结果. 并且对于开源的项目(pytorch), 我也可以运行, 并且使用. 可以说, 在这个阶段, 我只能做到去使用那些工具, 并且已经高度依赖fastai提供的封装好的api. 

事实上就以深度学习来说, 真正能做到创新的人还是很少的, 能够使用他人的提出的方法已经足够应付多数工业界的场景了.

> ### 为什么要学习deep learning以及真正门槛

机器学习, 深度学习, 神经网络, 当然以及更吓人的名头: 人工智能. 这是一个自计算机诞生不久就产生的概念, 但也是一个相当新的领域. </br>
用代码编程, 是十分直白的, 可解释的, 有逻辑的, 并且可以解决很多问题. 但是用代码怎么去区分猫狗? 这类对于人类来说很简单的问题, 如果翻译成代码却无从下手, 因为猫狗都有两只耳朵, 4条腿, 眼睛, 胡须, 尾巴. 基于特征的面向对象编程显然难以实现这个归类的任务. 但是机器学习可以做到, 用最简单的线性方程, 也能得到还可以的结果. 并且对于一些模型和调参的trick, 人们都不能很好的解释为什么起作用. 

这是一个全新的领域, 是一个黑盒, 基于生活经验得到的方法能改善结果, 我想这些理由就足够了, 我喜欢在黑暗中探索. 通常最底层的组成部分往往拥有极大的能量, 原子是, 数字也应该是. 所有机器学习的可能性是值得期待的, 参与到这个浪潮中, 哪怕只是使用别人发明的工具, 仅仅是体验到人类最前沿的研究, 也足以让人兴奋.

> ### 你需要准备的

1. 对于系统的基本知识, 无需精通, 只需要能够使用shell指令, 对不同环境下出现的问题进行debug. 设置环境是第一步, 虽然fastai介绍了很多预设好的, 仅针对fastai课程的网站.

2. 流畅的Python编程能力. Jeremy用了很多Python的高级语法, 完全不懂python只会让你学得更痛苦.

3. 数学知识, 以及一些空间想象力. fastai有一篇文章, 介绍了所需的数学知识, 建议浏览一遍,有个印象. 整个课程中涉及大量的对矩阵的操作, 在某个维度就和, 对矩阵的转置等. 你可能会想了解每一步操作后, 矩阵的shape.

4. 大约200小时的GPU服务器租用. 根据服务器和地区不同, 可能会花费1500RMB左右. 除去运行一遍课程代码的时间, 你可能想尝试一下操作, 看看结果. 没有什么比实践更能加深印象.(再次感谢AWS和Wework给的credit, 让我可以大量的尝试.)


## EN

It was about 2 years ago when I fitst touched with fastai. But I'm just getting started with machine learning in 2021. Fastai did its propaganda with no Phd, no coding experience and no mathmatics you can get started with deep learning. Without threshold and within 8 lessons you can acquire (one of) the most cutting-edge technology on the earth. That's quite fancy, and I really hope it's true, but if so, I won't take 2 years to just get started.

The first fastai course I had was course version 3, 8 lessons in total. After 5 or 6 lessons, I just can't understand the content anymore. So let's take a look at the deficienies of course v3. Okay, the first lesson is nice, a simple model to discriminate cat and dog, simple and less code. And if there's something you don't understand, Jeremy will tell you we will get to that in the later lessons. And the first couple of lessons introducing several applications deep learning good at are basically follow the same pattern, few lines of code, wonderful results, the progress you don't need to understand will be explained later. Then difficulty of the course just creep up from the time start to explain foundamental knowledge. And you will lose progress if you are stucked on one of those lessons. As to students who are fresh to Python, each line of code will take some time to understand. But Jeremy prefer to implement same functionality in different ways, it's understandable that Jeremy want to show more code, but it's a nightmare to freshmen.

In 2020, fastai introduced course version 4 along with fastbook. Beginners will get a much smoother learning curve in this course. Instead of trying to cover as many topics as possible, course v4 focused on three main ones, Image Classifier, Tabular Model, NLP. Teaching methodology also improved. By starting with a simplest model, indroduce solutions step by step once encounter problems. Go through each tricks and implement them and see results. Latter lessons also implement fastai apis from stratch. Course v4 still contains 8 video lessons, more content are included in fastbook. Video lessons also follow fastbook, so it depends you to watch video or read book.

So what you will get from this course? Jeremy talked a lot about those famous fastai students. They got a greate achievement in different domain. And I believe there are more students who even not finish course. But what will a average student like me will get? As for me, I know the basic usage of those fine tuning methods. I know how to train a model. I can train a model with state-of-the-art result if there's no problem with data. I can run those open source projects(Pytorch), and take advantage of them. At current stage, I can only use these tools to solve problems and highly rely on fastai apis.


> ### Why should you learn deep learing and the true threhold of it

Machine learning, deep learning, neural network, of course the scaring jargon: Artifical Intelligence. This is a concept around since computer been invented, but still a new field.

