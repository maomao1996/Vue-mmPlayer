
// audio元素
export const audioEle = (state) => state.audioEle
// 播放模式
export const mode = (state) => state.mode
// 播放状态
export const playing = (state) => state.playing
// 播放列表
export const playlist = (state) => state.playlist
// 顺序列表
export const orderList = (state) => state.orderList
// 当前音乐索引
export const currentIndex = (state) => state.currentIndex
// 当前音乐 -- 其实currentMusic()本质是computed函数,即其中函数使用的变化变化时currentMusic这个"变量"就会改变
export const currentMusic = (state) => {
  //console.log('getters currentMusic')
  return state.playlist[state.currentIndex] || {}
}
// 播放历史列表
export const historyList = (state) => state.historyList
// 网易云用户UID
export const uid = (state) => state.uid
// 评论开关
export const commentOpen = (state) => state.commentOpen

// 歌单映射表
export const musicListMap = (state) => state.musicListMap
// 添加歌曲到歌单的结果信息
export const manageMusicListRes = (state) => state.manageMusicListRes

export const autoSearchAudioSource = (state) => state.autoSearchAudioSource

export const useBindAudio = (state) => state.useBindAudio

export const songsAudioCandidates = (state) => state.songsAudioCandidates

