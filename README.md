# mmPlayer V1.5.2（2018.05.23）

模仿QQ音乐网页版界面，采用flexbox和position布局；
mmPlayer虽然是响应式，但主要以为PC端为主，移动端只做相应适配（未做歌词显示）；
只做主流浏览器兼容（对IE说拜拜，想想以前做项目还要兼容IE7，都是泪啊！！！）

> #### api：一个开源的[网易云音乐 NodeJS 版 API](https://binaryify.github.io/NeteaseCloudMusicApi)（有api才有动力写！！！）

> #### [在线演示地址](http://music.mtnhao.com)

> #### [桌面版下载](http://cdn.mtnhao.com/mmPlayer.zip)

> #### [React移动端版本（高仿网易云音乐）](https://github.com/maomao1996/react-music)

> #### [交流QQ群：529940193](http://shang.qq.com/wpa/qunwpa?idkey=f8be1b627a89108ccfda9308720d2a4d0eb3306f253c5d3e8d58452e20b91129)

## 如何安装与使用

> mmPlayer

```
git clone https://github.com/maomao1996/Vue-mmPlayer.git  //下载mmPlayer

cd mmPlayer //进入mmPlayer播放器目录

npm install //安装依赖

npm run dev //服务端运行

npm run build  //项目打包
```

> 后台服务器

```
cd mmPlayer/server //进入后台服务器目录

npm install //安装依赖

node app.js //服务端运行 访问 http://localhost:3000
```

#### 运行mmPlayer后无法获取音乐请检查后台服务器是否启动
#### assets/js/config的url地址要和后台服务器地址一致

## 技术栈

- Vue-Cli（Vue 脚手架工具）
- Vue（核心框架）
- Vue-Router（页面路由）
- Vuex（状态管理）
- ES 6 / 7 （JavaScript 语言的下一代标准）
- Less（CSS预处理器）
- Axios（网络请求）
- FastClick（解决移动端300ms点击延迟）

## 项目布局

```
├── build                                           // webpack配置文件
├── config                                          // 项目打包路径
├── mmPlayer                                        // 项目打包版本，可直接使用
├── screenshots                                     // 项目截图
├── server                                          // 后台服务器目录
├── src                                             // 项目源码目录
│   ├── api                                         // 数据交互目录
│   │   └── music.js                                // 获取数据
│   ├── assets                                      // 资源目录
│   │   ├── css                                     // 样式文件目录
│   │   │   ├── index.less                          // mmPlayer相关基础样式
│   │   │   ├── mixin.less                          // 样式混合
│   │   │   ├── reset.less                          // 样式重置
│   │   │   └── var.less                            // 样式变量（字体大小、字体颜色、背景颜色）
│   │   ├── img                                     // 静态图片目录
│   │   └── js                                      // 数据交互目录
│   │        ├── config.js                          // 基本配置
│   │        ├── mixin.js                           // 组件混合
│   │        ├── song.js                            // 数据处理
│   │        ├── storage.js                         // localstorage配置
│   │        └── util.js                            // 公用js方法
│   ├── base                                        // 公共基础组件目录
│   │   ├── mm-dialog
│   │   │   └── mm-dialog.vue                       // 对话框组件
│   │   ├── mm-loading
│   │   │   └── mm-loading.vue                      // 加载动画组件
│   │   ├── mm-no-result
│   │   │   └── mm-no-result.vue                    // 暂无数据提示组件
│   │   ├── mm-progress
│   │   │   └── mm-progress.vue                     // 进度条拖动组件
│   │   └── mm-toast
│   │        └── mm-toast.vue                       // 弹出层提示组件
│   ├── components                                  // 公共项目组件目录
│   │   ├── lyric
│   │   │   └── lyric                               // 歌词和封面组件
│   │   └── mm-header
│   │   │   └── mm-header.vue                       // 头部组件
│   │   ├── music-btn
│   │   │   └── music-btn.vue                       // 按钮组件
│   │   └── music-list
│   │        └── music-list.vue                     // 列表组件
│   ├── pages                                       // 入口主文件
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
│   │   ├── userList
│   │   │   └── userList.vue                        // 我的歌单
│   │   ├── topList
│   │   │   └── topList.vue                         // 排行榜页面
│   │   ├── mmPlayer.js                             // 播放器事相关件绑定
│   │   └── mmPlayer.vue                            // 播放器主页面
│   ├── router
│   │   └── index.js                                // 路由配置
│   ├── store                                       // vuex的状态管理
│   │   ├── actions.js                              // 配置actions
│   │   ├── getters.js                              // 配置getters
│   │   ├── index.js                                // 引用vuex，创建store
│   │   ├── mutations.js                            // 配置mutations
│   │   ├── mutation-types.js                       // 定义常量mutations名
│        └── state.js                               // 配置state
│   ├── App.vue                                     // 根组件
│   └── main.js                                     // 入口主文件
├── static                                          // 静态资源文件目录
└── index.html                                      // 入口html文件
```

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

PC端界面自我感觉还行， 就是移动端界面总觉得怪怪的，奈何审美有限，所以又去整了高仿网易云的 React 版本（如果小哥哥、小姐姐们有好看的界面，欢迎交流哈）

### PC

#### 正在播放
![正在播放](https://user-gold-cdn.xitu.io/2018/5/17/1636bc3d8cb660c8?w=1920&h=1006&f=png&s=643864)
#### 排行榜
![排行榜](https://user-gold-cdn.xitu.io/2018/5/17/1636bc3d8e6ff8e6?w=1920&h=1006&f=png&s=871255)
#### 搜索
![搜索](https://user-gold-cdn.xitu.io/2018/5/17/1636bc3d8d19a51f?w=1920&h=1007&f=png&s=629351)
#### 我的歌单
![我的歌单](https://user-gold-cdn.xitu.io/2018/5/17/1636bc3d8e9c9182?w=1920&h=1005&f=png&s=1296698)
#### 我听过的
![我听过的](https://user-gold-cdn.xitu.io/2018/5/17/1636bc3d8ea461ee?w=1920&h=1003&f=png&s=646239)
#### 歌曲评论
![歌曲评论](https://user-gold-cdn.xitu.io/2018/5/17/1636bc3d8edbd1b0?w=1920&h=1006&f=png&s=675028)

### 移动端

![移动端一](https://user-gold-cdn.xitu.io/2018/5/18/1637315324ff1e07?w=2934&h=1653&f=png&s=1109772)
![移动端二](https://user-gold-cdn.xitu.io/2018/5/18/1637315a6cdc532a?w=2934&h=1653&f=png&s=1442389)

## 更新说明

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
- 新增title提示
- 新增noscript提示
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
- 修复safari和安卓UC不能播放的问题
- 优化url失效问题和音乐无法播放的提示
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
- 新增版权信息（控制台输入mmPlayer）
- 增加背景滤镜的模糊度和透明度
- 增加浏览器访问的限制（兼容主流浏览器，最好全是用chrome，哈哈）
- 整合music-list组件
- CSS的@import使用 ~ 代替相对路径（原理：css-loader会把把非根路径的url解释为相对路径，加~前缀才会解释成模块路径）
- 优化Safari下不能滚动和不能播放的问题
- 优化移动端300ms点击延迟
- 优化当播放列表只有一首歌时，点击上（下）一曲导致播放失败的问题
- 优化重复插入音乐的问题
- 优化暂停后播放下一首播放状态图标不改变的问题

### V1.2.1（2018.03.01）
- 优化正在播放列表第一次加载
- 优化删除歌曲
- 优化Vuex模块
- 优化加载loading
- 优化移动端适配
- 提高代码复用性

### V1.2.0（2018.02.28）
- 新增搜索功能
- 新增歌曲删除功能（播放历史列表）
- 使用ES6的class对数据进行二次处理
- 优化歌词居中显示
- 优化播放可能出现的错误

### V1.1.0（2018.02.09）
- 新增我听过的（播放历史）
- 整合公用列表组件
- 新增mmToast插件
- 整合字体大小、颜色相关CSS
- 优化清空正在播放列表功能

### V1.0.0（2018.02.05）
- 发布正式版（因为一系列原因，mmPlayer V1.0.0版本在试用版的基础上进行了重构了，并引入了Vue-Router和Vuex
- 当前播放歌曲高亮（感觉一个小GIF还不够）
- 优化快速切歌导致歌曲播放失败的问题
- 进度条拖动适配移动端
- 优化点击时可能出现的半透明背景
- 新增排行榜

## 其他说明

- 个人练手项目（本想先做移动端的，但是发现有很多人都做过，就稍微标新立异做个PC端）
- 如果您喜欢该作品，您可以点右上角 "Star" "Fork" 表示支持 谢谢！
- 后续：移动端版本、其他作品
- 如有问题请直接在 Issues 中提，或者您发现问题并有非常好的解决方案，欢迎 PR

## License

[MIT](https://github.com/maomao1996/Vue-mmPlayer/blob/master/LICENSE)
