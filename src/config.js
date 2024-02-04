/* 版本号 */
export const VERSION = process.env.VUE_APP_VERSION

/**
 * 访客统计 id
 * 具体使用文档 https://github.com/jwenjian/visitor-badge
 */
export const VISITOR_BADGE_ID = process.env.VUE_APP_VISITOR_BADGE_ID

/* 背景图（可引入网络图或本地静态图） */
const requireAll = (requireContext) => requireContext.keys().map(requireContext)
const BACKGROUNDS = requireAll(require.context('./assets/background', false))

/**
 * 播放模式
 * LIST_LOOP: 列表循环
 * ORDER: 顺序播放
 * RANDOM: 随机播放
 * LOOP: 单曲循环
 */
export const PLAY_MODE = {
  LIST_LOOP: 0,
  ORDER: 1,
  RANDOM: 2,
  LOOP: 3,
}
/**
 * 我将bili上的音乐下载到服务器指定目录了, 音频文件命名方式以bvid_开头,加上bvid. 该目录由nginx管理,所以直接拿url可以获取该目录下的资源
 */
// 引入不起作用??
export const BILI_AUDIO_PATH =  process.env.BILI_AUDIO_DOWNLOAD_PATH
export const AUDIO_PATH = 'http://ip:port'

/**
 * 播放器默认配置
 */
export const MMPLAYER_CONFIG = {
  /**
   * 默认歌单ID （正在播放列表）
   * 默认为云音乐热歌榜 https://music.163.com/#/discover/toplist?id=3778678
   */
  PLAYLIST_ID: 3778678,
  /* 默认播放模式 */
  PLAY_MODE: PLAY_MODE.LIST_LOOP,
  /* 默认音量 */
  VOLUME: 0.8,
  /* 默认背景 */
  BACKGROUND: BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)],
}

/* 默认分页数量 */
export const DEFAULT_LIMIT = 30
