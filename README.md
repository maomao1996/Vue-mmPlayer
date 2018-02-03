# mmPlayer V0.2.0（在线音乐播放器）
模仿QQ音乐网页版界面，采用flexbox和position布局，并适配了移动端

> api：一个开源的[网易云音乐 NodeJS 版 API](https://binaryify.github.io/NeteaseCloudMusicApi)（有api才有动力写！！！）

> [在线演示地址](http://music.mtnhao.com)

## 安装与使用

> 后台服务器

```
git clone git@github.com:Binaryify/NeteaseCloudMusicApi.git

cd NeteaseCloudMusicApi

npm install //安装依赖

node app.js //服务端运行 访问 http://localhost:3000
```

> mmPlayer

```
git clone https://github.com/maomao1996/mmPlayer.git

cd mmPlayer

npm install //安装依赖

npm run dev //服务端运行

npm run build  //项目打包 
```
需要修改api目录下music的url地址为后台服务器地址

## 技术栈

- Vue（核心框架）
- axios（网络请求）


## 功能

- 播放器：暂停播放，、上一曲、下一曲，进度条拖动（暂时未适配移动端）
- 列表：切换音乐
- 歌词滚动
- 支持音乐下载（弹出下载框后，需要手动粘贴歌曲名）
- 界面兼容PC端和移动端

## 更新说明
### V0.1.0（2018.01.24）
- 发布试用版


### V0.2.0（2018.01.29）
- 新增音量控制模块
- 优化歌曲选中

## 其他说明

此版本为试用版本，暂不支持切换播放列表，只兼容主流浏览器（其他IE什么的我没听说过）
