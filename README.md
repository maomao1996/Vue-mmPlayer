# mmPlayer V1.6.2（2019.11.17）启动 2.0 版本

模仿 QQ 音乐网页版界面，采用 flexbox 和 position 布局；
mmPlayer 虽然是响应式，但主要以 PC 端为主，移动端只做相应适配（未做歌词显示）；
只做主流浏览器兼容（对 IE 说拜拜，想想以前做项目还要兼容 IE7 ，都是泪啊！！！）

> api：一个开源的[网易云音乐 NodeJS 版 API](https://binaryify.github.io/NeteaseCloudMusicApi)（有 api 才有动力写！！！）

> [在线演示地址](http://music.mtnhao.com)

> [React 移动端版本（高仿网易云音乐）](https://github.com/maomao1996/react-music)

> [交流 QQ 群：529940193](http://shang.qq.com/wpa/qunwpa?idkey=f8be1b627a89108ccfda9308720d2a4d0eb3306f253c5d3e8d58452e20b91129)

> 本播放器由 [maomao1996](https://github.com/maomao1996) 开发，您可以随意修改、使用、转载。但使用或转载时请务必保留出处！！！

## 免责声明

本站音频文件来自各网站接口，本站不会修改任何音频文件

音频版权来自各网站，本站只提供数据查询服务，不提供任何音频存储和贩卖服务

本项目仅为前端练手项目，请勿用作商业用途，请勿通过本项目下载盗版歌曲资源，否则后果自负！

## 如何安装与使用

> mmPlayer

```
git clone https://github.com/maomao1996/Vue-mmPlayer.git  //下载 mmPlayer

cd Vue-mmPlayer // 进入 mmPlayer 播放器目录

npm install // 安装依赖

npm run serve // 运行 mmPlayer

npm run build  // 项目打包
```

> 后台服务器

[网易云音乐 NodeJS 版 API](https://binaryify.github.io/NeteaseCloudMusicApi)

```
下载 NeteaseCloudMusicApi

npm install // 安装依赖

node app.js // 服务端运行 访问 http://localhost:3000
```

#### 运行 mmPlayer 后无法获取音乐请检查后台服务器是否启动

#### .env 文件的 VUE_APP_BASE_API_URL 地址要和后台服务器地址一致

## 技术栈

- Vue-Cli（Vue 脚手架工具）
- Vue（核心框架）
- Vue-Router（页面路由）
- Vuex（状态管理）
- ES 6 / 7 （JavaScript 语言的下一代标准）
- Less（CSS 预处理器）
- Axios（网络请求）
- FastClick（解决移动端 300ms 点击延迟）

## 项目结构目录图（使用 tree 生成）

<details>
<summary>展开查看</summary>
<pre><code>
├── mmPlayer                                        // 项目打包版本，可直接使用
├── public                                          // 静态资源目录
│   └─index.html                                    // 入口 html 文件
├── screenshots                                     // 项目截图
├── src                                             // 项目源码目录
│   ├── api                                         // 数据交互目录
│   │   └── index.js                                // 获取数据
│   ├── assets                                      // 资源目录
│   │   └── background                              // 启动背景图目录
│   │   └── img                                     // 静态图片目录
│   ├── base                                        // 公共基础组件目录
│   │   ├── mm-dialog
│   │   │   └── mm-dialog.vue                       // 对话框组件
│   │   ├── mm-icon
│   │   │   └── mm-icon.vue                         // icon 组件
│   │   ├── mm-loading
│   │   │   └── mm-loading.vue                      // 加载动画组件
│   │   ├── mm-no-result
│   │   │   └── mm-no-result.vue                    // 暂无数据提示组件
│   │   ├── mm-progress
│   │   │   └── mm-progress.vue                     // 进度条拖动组件
│   │   └── mm-toast
│   │        ├── index.js                           // mm-toast 组件插件化配置
│   │        └── mm-toast.vue                       // 弹出层提示组件
│   ├── components                                  // 公共项目组件目录
│   │   ├── lyric
│   │   │   └── lyric                               // 歌词和封面组件
│   │   └── mm-header
│   │   │   └── mm-header.vue                       // 头部组件
│   │   ├── music-btn
│   │   │   └── music-btn.vue                       // 按钮组件
│   │   ├── music-list
│   │   │    └── music-list.vue                     // 列表组件
│   │   └── volume
│   │        └── volume.vue                         // 音量控制组件
│   ├── pages                                       // 页面组件目录
│   │   ├── comment
│   │   │   └── comment.vue                         // 评论
│   │   ├── details
│   │   │   └── details.vue                         // 排行榜详情
│   │   ├── historyList
│   │   │   └── historyList.vue                     // 我听过的（播放历史）
│   │   ├── playList
│   │   │   └── playList.vue                        // 正在播放
│   │   ├── search
│   │   │   └── search.vue                          // 搜索
│   │   ├── topList
│   │   │   └── topList.vue                         // 排行榜页面
│   │   ├── userList
│   │   │   └── userList.vue                        // 我的歌单
│   │   ├── mmPlayer.js                             // 播放器事相关件绑定
│   │   └── music.vue                               // 播放器主页面
│   ├── router
│   │   └── index.js                                // 路由配置
│   ├── store                                       // vuex 的状态管理
│   │   ├── actions.js                              // 配置 actions
│   │   ├── getters.js                              // 配置 getters
│   │   ├── index.js                                // 引用 vuex，创建 store
│   │   ├── mutation-types.js                       // 定义常量 mutations 名
│   │   ├── mutations.js                            // 配置 mutations
│   │   └── state.js                                // 配置 state
│   ├── styles                                      // 样式文件目录
│   │   ├── index.less                              // mmPlayer 相关基础样式
│   │   ├── mixin.less                              // 样式混合
│   │   ├── reset.less                              // 样式重置
│   │   └── var.less                                // 样式变量（字体大小、字体颜色、背景颜色）
│   ├── js                                          // 数据交互目录
│   │   ├── hack.js                                 // 修改 nextTick 
│   │   ├── mixin.js                                // 组件混合
│   │   ├── song.js                                 // 数据处理
│   │   ├── storage.js                              // localstorage 配置
│   │   └── util.js                                 // 公用 js 方法
│   ├── App.vue                                     // 根组件
│   ├── config.js                                   // 基本配置
│   └── main.js                                     // 入口主文件
└── vue.config.js                                   // vue-cli 配置文件

</code></pre>

</details>

## 功能

- 播放器
- 快捷键操作
- 歌词滚动
- 正在播放
- 排行榜
- 歌单详情
- 搜索
- 播放历史
- 查看评论
- 同步网易云歌单

## 界面欣赏

PC 端界面自我感觉还行， 就是移动端界面总觉得怪怪的，奈何审美有限，所以又去整了高仿网易云的 React 版本（如果小哥哥、小姐姐们有好看的界面，欢迎交流哈）

### PC

#### 正在播放

![正在播放](https://raw.githubusercontent.com/maomao1996/Vue-mmPlayer/master/screenshots/1.jpg)

#### 排行榜

![排行榜](https://raw.githubusercontent.com/maomao1996/Vue-mmPlayer/master/screenshots/2.jpg)

#### 搜索

![搜索](https://raw.githubusercontent.com/maomao1996/Vue-mmPlayer/master/screenshots/3.jpg)

#### 我的歌单

![我的歌单](https://raw.githubusercontent.com/maomao1996/Vue-mmPlayer/master/screenshots/4.jpg)

#### 我听过的

![我听过的](https://raw.githubusercontent.com/maomao1996/Vue-mmPlayer/master/screenshots/5.jpg)

#### 歌曲评论

![歌曲评论](https://raw.githubusercontent.com/maomao1996/Vue-mmPlayer/master/screenshots/6.jpg)

### 移动端

![移动端一](https://raw.githubusercontent.com/maomao1996/Vue-mmPlayer/master/screenshots/7.jpg)
![移动端二](https://raw.githubusercontent.com/maomao1996/Vue-mmPlayer/master/screenshots/8.jpg)

## 更新说明

### V1.6.2（2019.11.17）

- 提高歌词滚动精度

### V1.6.1（2019.09.28）

- 修复歌单列表无数据时 JS 报错问题
- 优化有文字复制选中时进度条拖动异常问题

### V1.6.0（2019.08.26）

- 采用字体图标
- 优化歌词滚动处理
- 修复推荐页面样式问题
- 调整封面图的分辨率
- 优化首屏加载动画逻辑

### V1.5.7（2019.08.19）

- 增加默认背景图随机展示，同时出除默认背景图，需开发者自行引入网络图 / 本地图
- 调整默认音量
- 优化首屏加载动画样式（提高逼格）
- 优化 load 遮罩颜色

### V1.5.6（2019.04.04）

- 升级 Vue 版本
- 优化脚手架配置
- 修复 Safari、IOS 微信、安卓 UC 不能播放问题

### V1.5.5（2019.03.29）

- 修改 Vue 构建版本
- 优化滚动体验，缓存滚动位置
- 优化暂停 / 播放逻辑，减少重复请求
- 优化代码，提高复用
- 修复 IOS 下滚动卡顿的情况

### V1.5.4（2019.01.08）

- 更新后台服务器
- 修复无法播放问题
- 修复歌单详情打开失败问题
- 修改音乐是否可用的判断逻辑
- 优化登录操作体验，增加回车事件监听
- 扩大查看评论者主页点击范围

### V1.5.3（2018.07.30）

- 修复列表只有一首歌时的 BUG
- 去除无关请求操作
- 优化请求播放列表逻辑

### V1.5.2（2018.05.23）

- 新增推荐歌单
- 新增图片懒加载
- 更新获取歌单列表接口
- 优化歌单列表展示

### V1.5.1（2018.05.21）

- 更新后台服务器
- 修改热搜展示数据
- 提取基础网络请求中的配置

### V1.5.0（2018.05.05）

- 新增评论详情功能（网易云音乐最重要的部分不能漏）
- 新增 title 提示
- 新增 noscript 提示
- 优化歌词滚动
- 优化图片大小，提升加载速度
- 优化歌曲切换时样式错乱
- 增强模块化

### V1.4.0（2018.04.09）预期功能全部完成

- 新增同步网易云歌单功能
- 新增快捷键控制
  - 上一曲 Ctrl + Left
  - 播放暂停 Ctrl + Space
  - 下一曲 Ctrl + Right
  - 切换播放模式 Ctrl + O
  - 音量加 Ctrl + Up
  - 音量减 Ctrl + Down
- 修复 safari 和安卓 UC 不能播放的问题
- 优化 url 失效问题和音乐无法播放的提示
- 优化移动端下的样式兼容

### V1.3.2（2018.03.19）

- 新增播放链接失效后自动重载当前音乐
- 优化列表循环不会自动下一曲问题
- 优化删除正在播放列表歌曲失效问题
- 优化删除歌曲过快会触发播放问题
- 优化音乐来源错误不能播放问题，并使用 oncanplay
- 添加播放历史，避免不能播放的音乐加入播放历史
- 修复不能加入音乐到我听过的问题

### V1.3.1（2018.03.12）

- 新增双击播放
- 新增更新提示
- 优化无歌词时的显示
- 优化暂无内容提醒
- 优化列表多位歌手的显示

### V1.3.0（2018.03.07）

- 新增随机播放、列表循环、单曲循环、顺序播放功能
- 新增清空正在播放列表功能
- 新增清空列表的提示
- 新增版权信息（控制台输入 mmPlayer ）
- 增加背景滤镜的模糊度和透明度
- 增加浏览器访问的限制（兼容主流浏览器，最好全是用 chrome，哈哈）
- 整合 music-list 组件
- CSS 的 @import 使用 ~ 代替相对路径（原理：css-loader 会把非根路径的 url 解释为相对路径，加~前缀才会解释成模块路径）
- 优化 Safari 下不能滚动和不能播放的问题
- 优化移动端 300ms 点击延迟
- 优化当播放列表只有一首歌时，点击上（下）一曲导致播放失败的问题
- 优化重复插入音乐的问题
- 优化暂停后播放下一首播放状态图标不改变的问题

### V1.2.1（2018.03.01）

- 优化正在播放列表第一次加载
- 优化删除歌曲
- 优化 Vuex 模块
- 优化加载 loading
- 优化移动端适配
- 提高代码复用性

### V1.2.0（2018.02.28）

- 新增搜索功能
- 新增歌曲删除功能（播放历史列表）
- 使用 ES6 的 class 对数据进行二次处理
- 优化歌词居中显示
- 优化播放可能出现的错误

### V1.1.0（2018.02.09）

- 新增我听过的（播放历史）
- 整合公用列表组件
- 新增 mmToast 插件
- 整合字体大小、颜色相关 CSS
- 优化清空正在播放列表功能

### V1.0.0（2018.02.05）

- 发布正式版（因为一系列原因，mmPlayer V1.0.0 版本在试用版的基础上进行了重构了，并引入了 Vue-Router 和 Vuex
- 当前播放歌曲高亮（感觉一个小 GIF 还不够）
- 优化快速切歌导致歌曲播放失败的问题
- 进度条拖动适配移动端
- 优化点击时可能出现的半透明背景
- 新增排行榜

## 其他说明

- 个人练手项目（本想先做移动端的，但是发现有很多人都做过，就稍微标新立异做个 PC 端）
- 如果您喜欢该作品，您可以点右上角 "Star" "Fork" 表示支持 谢谢！
- 后续：移动端版本、其他作品
- 如有问题请直接在 Issues 中提，或者您发现问题并有非常好的解决方案，欢迎 PR

## License

[MIT](https://github.com/maomao1996/Vue-mmPlayer/blob/master/LICENSE)
