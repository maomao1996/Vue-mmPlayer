export class Song {
  constructor({platform, limit, id, name, subTitle, singer, album, image, duration, originDuration, url, audioSource, lyricSource, audioSources, count}) {
    this.limit = limit //在平台上是否受限制
    this.platform = platform    //对于普通音频,platform用各个平台表示,包含b站. 对于组合音频, 用complex表示其类型.
    this.id = id //对于complex类型歌曲记录, id采用拼接的方式,中间用'-'分割
    this.name = name
    this.subTitle = subTitle
    this.singer = singer
    this.album = album
    this.image = image
    this.duration = duration //对于平台歌曲, 显示其试听时长
    this.originDuration = originDuration //该首歌真正的时长
    this.url = url //平台url
    this.audioSource = audioSource // bvid/cid及查询的urls.
    this.lyricSource = lyricSource // 歌词来源,封面大概率也来源于此
    this.mixInfo = null // 歌曲拼接的信息
    this.audioSources = audioSources
    this.count = count
  }
}
/*
1. 在搜索页面的每条结果添加button,用户在某歌曲上点击就会用其歌名/歌手/时长去b站搜索(跳转到b站搜索页面)
  1.1 说明: 显示时长1min和30s的都是平台试听版. 试听版基本都是正版,大概率是原唱. 推荐用这个进行b站搜索
2. b站搜索默认搜出20条复合时长条件的(需要发送多次搜索请求过滤出20条).并对20条结果封装其url和质量(质量需要显示在视频封面右下角)
3. 点击播放,不会将该视频加入历史记录及绑定到该歌曲, 但是会展示播放效果,即显示歌词. 用户点击播放后, 在页面显示绑定按钮.
 绑定时校验时长,防止歌词显示误差太大. 再检查下歌名是否对应
  3.1 用户可以自由在b站搜索中搜东西, 此时只是封装为b站音频对象进行播放, 不会加入历史记录也不会添加
  3.2 用户如果自由搜索遇到好听的歌曲, 可以反向绑定到正版歌曲上.
    1. 反向绑定方式: 用户复制bvid, 然后到搜索页面正常搜索要绑定的歌曲, 搜到歌曲后在歌曲身上点击绑定, 此时会跳到b站搜索页(会提供20条可用资源). 此时b站搜索页还是可以进行搜索的
      用户输入bvid搜索到视频, 点击绑定即可.(注意绑定button只有全局变量中保存"正在搜索music"才显示, 另外提供按钮清除搜索页和比例搜索页的数据)
4. 添加一个绑定按钮, 进行绑定, 然后将该首歌的完整信息封装保留到播放列表. 提醒用户将残缺版的播放记录删除(也可以不提醒).

5. 自动将当前列表所有歌曲补充为完整版. 并导出一个"完整版"歌单保存在我的网站

bug:
1.
 */
