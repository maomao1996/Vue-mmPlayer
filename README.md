# mmPlayer

> mmPlayer 是由茂茂开源的一款在线音乐播放器，具有音乐搜索、播放、歌词显示、播放历史、查看歌曲评论、网易云用户歌单播放同步等功能

模仿 QQ 音乐网页版界面，采用 `flexbox` 和 `position` 布局；<br />
mmPlayer 虽然是响应式，但主要以 PC 端为主，移动端只做相应适配；<br />
只做主流浏览器兼容（对 IE 说拜拜，想想以前做项目还要兼容 IE7 ，都是泪啊！！！）

- [在线演示地址](https://netease-music.fe-mm.com/)
- [React 移动端版本（高仿网易云音乐）](https://github.com/maomao1996/react-music)
- [交流 QQ 群：529940193](http://shang.qq.com/wpa/qunwpa?idkey=f8be1b627a89108ccfda9308720d2a4d0eb3306f253c5d3e8d58452e20b91129) 本群不解答部署相关问题，如有部署问题请看[关于项目线上部署](#关于项目线上部署)
- 本播放器由 **[茂茂](https://github.com/maomao1996) 开发**，您可以随意修改、使用、转载。但**使用或转载时请务必保留出处（控制台的注释信息）**！！！

## 免责声明

1. 本项目是一个**前端练手的实战项目**，旨在**帮助开发者提升技能水平和对前端技术的理解**。

2. 本项目**不提供任何音频存储和贩卖服务**。所有音频内容均由网易云音乐的第三方 API 提供，**仅供个人学习研究使用，严禁将其用于任何商业及非法用途**，版权归原始平台所有。

3. 使用本项目造成的任何纠纷、责任或损失**由使用者自行承担**。本项目开发者不对因使用本项目而产生的任何直接或间接责任承担责任，并保留追究使用者违法行为的权利。

4. **请使用者在使用本项目时遵守相关法律法规，不得将本项目用于任何商业及非法用途**。如有违反，一切后果由使用者自负。同时，使用者应该自行承担因使用本项目而带来的风险和责任。

5. 本项目使用了网易云音乐的[第三方 API 服务](https://github.com/Binaryify/NeteaseCloudMusicApi)，对于该第三方 API 服务造成的任何问题，本项目开发者不承担责任。

请在使用本项目之前仔细阅读以上免责声明，并确保您已完全理解并接受其中的所有条款和条件。如果您不同意或无法遵守这些规定，请不要使用本项目。

## 安装与使用

### 检查 node 版本

```sh
# 查看 node 版本，确保 node 版本高于 12 版本
node -v
```

### mmPlayer

```sh
# 下载 mmPlayer
git clone https://github.com/maomao1996/Vue-mmPlayer

# 进入 mmPlayer 播放器目录
cd Vue-mmPlayer

# 安装依赖 推荐使用 pnpm
pnpm install
# 或者
npm install

# 本地运行 mmPlayer
npm run serve

# 编译打包
npm run build
```

### 后台 api 服务（本地开发）

[网易云音乐 NodeJS 版 API](https://binaryify.github.io/NeteaseCloudMusicApi)

```sh
# 下载 NeteaseCloudMusicApi
git clone --depth=1 https://github.com/Binaryify/NeteaseCloudMusicApi

# 进入 NeteaseCloudMusicApi 后台服务目录
cd NeteaseCloudMusicApi

# 安装依赖
npm install

# 运行后台 api 服务 访问 http://localhost:3000
node app.js
```

### 注意点

**运行 mmPlayer 后无法获取音乐请检查后台 `api` 服务是否启动(即控制台请求报 404)**<br />
**线上部署不是直接将整个项目丢到服务器，再去运行 `npm run serve` 命令**<br />
**项目打包前 `VUE_APP_BASE_API_URL` 必须改后台 `api` 服务地址为线上地址，不能是本地地址**

### 关于项目线上部署

最近有不少小伙伴部署出了问题，我在这说明下

- 后台 `api` 服务线上部署
  - 你需要将 [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) 下载
  - 然后将下载的文件上传至服务器
  - 再通过 `pm2` 去启动服务(`pm2` 安装和相关命令网上有很多，这里不再赘述)
  - 最后通过服务器 `ip` + 端口号访问验证 `api` 服务是否启动成功
- `mmPlayer` 线上部署（推荐使用 [Vercel 部署](#vercel-部署)）
  - 首先要注意的是
  - 先将 `.env` 文件的 `VUE_APP_BASE_API_URL` 修改成上一步启动的后台 `api` 服务地址(服务器 `ip` + 端口号或者你绑定的域名)
  - 然后先在本地运行 `npm run build` 命令，会打包在生成一个 `dist` 文件
  - 最后将打包的 `dist` 文件上传到你的网站服务器目录即可
- 其他：[在宝塔面板部署 mmPlayer](https://github.com/maomao1996/Blog/issues/1)（不喜欢写文，可能有点烂不要介意哈）
- 最后：本人已和谷歌、百度达成合作了，如果还有啥不懂的，以后可以直接谷歌、百度

#### Vercel 部署

1. `fork` 此项目
2. 在 [Vercel](https://vercel.com) 官网点击 New Project
3. 点击 `Import Git Repository`
   1. 选择你 `fork` 的此项目
   2. 点击 `import`
4. `Configure Project` 配置
   1. `Project Name` 自己填
   2. `Framework Preset` 选 `Vue.js` （基本默认就是，不用修改）
   3. 点击 `Environment Variables`，并添加一条
      1. `key` 输入 `VUE_APP_BASE_API_URL`
      2. `value` 输入你后台 `api`（[NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)）服务的线上地址
5. 点击 `Deploy` 等部署完成即可

## 技术栈

- [Vue Cli](https://cli.vuejs.org/zh/) Vue 脚手架工具
- [Vue 2.x](https://v2.cn.vuejs.org/) 核心框架
- [Vue Router](https://router.vuejs.org/zh/) 页面路由
- [Vuex](https://vuex.vuejs.org/zh/) 状态管理
- ES6 （JavaScript 语言的下一代标准）
- Less（CSS 预处理器）
- Axios（网络请求）
- FastClick（解决移动端 300ms 点击延迟）

## 项目结构目录图（使用 tree 生成）

<details>
<summary>展开查看</summary>
<pre><code>
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
│   │   ├── axios.js                                // axios 简单封装
│   │   ├── hack.js                                 // 修改 nextTick
│   │   ├── mixin.js                                // 组件混合
│   │   ├── song.js                                 // 数据处理
│   │   ├── storage.js                              // localStorage 配置
│   │   └── util.js                                 // 公用 js 方法
│   ├── App.vue                                     // 根组件
│   ├── config.js                                   // 配置文件（播放器默认配置、版本号等）
│   └── main.js                                     // 入口主文件
└── vue.config.js                                   // vue-cli 配置文件

</code></pre>

</details>

## 功能与界面

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

### 界面欣赏

PC 端界面自我感觉还行， 就是移动端界面总觉得怪怪的，奈何审美有限，所以又去整了高仿网易云的 `React` 版本（如果小哥哥、小姐姐们有好看的界面，欢迎交流哈）

<details>
<summary>点击查看</summary>

#### PC

##### 正在播放

![正在播放](https://cdn.jsdelivr.net/gh/maomao1996/Vue-mmPlayer/screenshots/1.jpg)

##### 排行榜

![排行榜](https://cdn.jsdelivr.net/gh/maomao1996/Vue-mmPlayer/screenshots/2.jpg)

##### 搜索

![搜索](https://cdn.jsdelivr.net/gh/maomao1996/Vue-mmPlayer/screenshots/3.jpg)

##### 我的歌单

![我的歌单](https://cdn.jsdelivr.net/gh/maomao1996/Vue-mmPlayer/screenshots/4.jpg)

##### 我听过的

![我听过的](https://cdn.jsdelivr.net/gh/maomao1996/Vue-mmPlayer/screenshots/5.jpg)

##### 歌曲评论

![歌曲评论](https://cdn.jsdelivr.net/gh/maomao1996/Vue-mmPlayer/screenshots/6.jpg)

#### 移动端

![移动端一](https://cdn.jsdelivr.net/gh/maomao1996/Vue-mmPlayer/screenshots/7.jpg)
![移动端二](https://cdn.jsdelivr.net/gh/maomao1996/Vue-mmPlayer/screenshots/8.jpg)

</details>

## 更新说明

### V1.8.3（2022.12.01）

- 修复音乐搜索
- 修复歌手信息为空
- 优化横向滚动条样式

<details>
<summary>查看更多</summary>

### V1.8.2（2021.08.23）

- 移除我的歌单喜欢的音乐
- 优化请求错误处理

### V1.8.1（2021.02.02）

- 修复音乐进度条点击无效问题

### V1.8.0（2020.08.22）

- 适配最新版后台 api
- 修复背景图白边

### V1.7.1（2020.07.11）

- 新增 IE 提示页面
- 统一错误处理

### V1.7.0（2020.06.27）

- 移动端增加歌词显示

### V1.6.9（2020.06.04）

- 修改登录用户头像和网易云跳转地址为 https 协议

### V1.6.8（2020.06.01）

- 修复歌单详情获取不到完整歌曲详情问题

### V1.6.7（2020.05.02）

- 优化进度条拖动，分离拖动进度和音乐播放进度

### V1.6.6（2020.04.18）

- 增加播放失败重试机制
- 优化 `toHttps` 方法和版本更新时间的写入

### V1.6.5（2020.04.09）

- 增加对 https 的支持

### V1.6.4（2020.02.04）

- 调整默认音量

### V1.6.3（2020.01.09）

- 修复快速滚动页面空白问题
- 修复播放失败控制台报错问题

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
- 优化 loading 遮罩颜色

### V1.5.6（2019.04.04）

- 升级 `Vue` 版本
- 优化脚手架配置
- 修复 Safari、IOS 微信、安卓 UC 不能播放问题

### V1.5.5（2019.03.29）

- 修改 `Vue` 构建版本
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

- 修复列表只有一首歌时的 `BUG`
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
- 新增 `title` 提示
- 新增 `noscript` 提示
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
- 优化 `url` 失效问题和音乐无法播放的提示
- 优化移动端下的样式兼容

### V1.3.2（2018.03.19）

- 新增播放链接失效后自动重载当前音乐
- 优化列表循环不会自动下一曲问题
- 优化删除正在播放列表歌曲失效问题
- 优化删除歌曲过快会触发播放问题
- 优化音乐来源错误不能播放问题，并使用 `oncanplay`
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
- 整合 `music-list` 组件
- `CSS` 的 `@import` 使用 `~` 代替相对路径（原理：`css-loader` 会把非根路径的 `url` 解释为相对路径，加 `~` 前缀才会解释成模块路径）
- 优化 Safari 下不能滚动和不能播放的问题
- 优化移动端 300ms 点击延迟
- 优化当播放列表只有一首歌时，点击上（下）一曲导致播放失败的问题
- 优化重复插入音乐的问题
- 优化暂停后播放下一首播放状态图标不改变的问题

### V1.2.1（2018.03.01）

- 优化正在播放列表第一次加载
- 优化删除歌曲
- 优化 `Vuex` 模块
- 优化加载 loading
- 优化移动端适配
- 提高代码复用性

### V1.2.0（2018.02.28）

- 新增搜索功能
- 新增歌曲删除功能（播放历史列表）
- 使用 `ES6` 的 `class` 对数据进行二次处理
- 优化歌词居中显示
- 优化播放可能出现的错误

### V1.1.0（2018.02.09）

- 新增我听过的（播放历史）
- 整合公用列表组件
- 新增 `mmToast` 插件
- 整合字体大小、颜色相关 `CSS`
- 优化清空正在播放列表功能

### V1.0.0（2018.02.05）

- 发布正式版（因为一系列原因，mmPlayer V1.0.0 版本在试用版的基础上进行了重构了，并引入了 `Vue Router` 和 `Vuex`
- 当前播放歌曲高亮（感觉一个小 GIF 还不够）
- 优化快速切歌导致歌曲播放失败的问题
- 进度条拖动适配移动端
- 优化点击时可能出现的半透明背景
- 新增排行榜

</details>

## 数据统计

因为百度统计现在数据存储时长默认为 1 年，造成前几年的数据都丢了（虽说没啥用，但是也是本作品成长的历史），所以在 [github](https://github.com/maomao1996/picture/tree/main/mmPlayer/stats) 保存下每年的累计访问

> 2022 年累计访问

![2022](https://cdn.jsdelivr.net/gh/maomao1996/picture/mmPlayer/stats/2022.png)

## 其他说明

- 个人练手项目（本想先做移动端的，但是发现有很多人都做过，就稍微标新立异做个 PC 端）
- 如有问题请直接在 [Issues](https://github.com/maomao1996/Vue-mmPlayer/issues/new) 中提，或者您发现问题并有非常好的解决方案，欢迎 `PR`
- 如果您喜欢该作品，您可以点右上角 "Star" 表示支持 谢谢！

## 鸣谢

特别感谢 [JetBrains](https://www.jetbrains.com/) 为开源项目提供免费的 [WebStorm](https://www.jetbrains.com/webstorm/) 授权

## License

[MIT](https://github.com/maomao1996/Vue-mmPlayer/blob/LICENSE)
