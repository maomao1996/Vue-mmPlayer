import * as types from './mutation-types'
import {delMusicList, getMusicListMap} from "@/utils/storage";

function findIndex(list, music) {
  return list.findIndex((item) => {
    return item.id === music.id
  })
}

const mutations = {
  // 修改audio元素
  [types.SET_AUDIOELE](state, audioEle) {
    state.audioEle = audioEle
  },
  // 修改播放模式
  [types.SET_PLAYMODE](state, mode) {
    state.mode = mode
  },
  // 修改播放状态
  [types.SET_PLAYING](state, playing) {
    //console.log('mutation 修改playing')
    state.playing = playing
  },
  // 修改播放列表
  [types.SET_PLAYLIST](state, playlist) {
    //console.log('mutation 修改playlist')
    state.playlist = playlist
  },
  // 修改顺序列表
  [types.SET_ORDERLIST](state, orderList) {
    state.orderList = orderList
  },
  // 修改当前音乐索引
  [types.SET_CURRENTINDEX](state, currentIndex) {
    //console.log('mutation 修改当前音乐索引')
    state.currentIndex = currentIndex
  },
  // 修改播放历史列表
  [types.SET_HISTORYLIST](state, historyList) {
    state.historyList = historyList
  },
  // 修改网易云用户UID
  [types.SET_UID](state, uid) {
    state.uid = uid
  },
  SET_COMMENT_OPEN(state, commentOpen) {
    state.commentOpen = commentOpen
  },
  SET_SEARCH_AUDIO(state, targetMusic = null) {
    state.searchAudio = targetMusic
  },
  // 点击播放时, 需要为当前song添加urls
  SET_MUSIC_AUDIO_URLS(state, urls) {
    state.playlist[state.currentIndex].audioSource.urls = urls
  },

  // 点击播放时, 需要为当前song添加urls
  INSERT_CURRENT_MUSIC(state, music) {
    // state.playlist[state.currentIndex] = music
    /*    //console.log('music =========', music)
        let i = state.currentIndex
        //console.log('afafa', state.playlist[i + 1].id)
        const parts1 = ((state.playlist[i + 1].id) + '').split("-");
        const result1 = parts1[0];
        const parts2 = music.id.split("-");
        const result2 = parts2[0];
        //console.log('choooooooooooo')
        //console.log(result1 , result2)*/
    //if (result1 !== result2)
    //state.playlist.splice(state.currentIndex + 1, 0, music)
    let list = [...state.playlist]
    // 查询当前播放列表是否有代插入的音乐，并返回其索引值
    let index = findIndex(list, music)
    // 当前播放列表有待插入的音乐时，直接改变当前播放音乐的索引值
    if (index > -1) {
      //console.log("当前播放列表有待插入的音乐")
      state.playlist.splice(state.currentIndex, 1)
      if (state.currentIndex <= index)
        state.currentIndex = index - 1
      else
        state.currentIndex = index
    } else {
      //console.log("替换当前播放的音频")
      state.playlist.splice(state.currentIndex, 1, music)
    }
  },

  ADD_MUSIC_LIST_TO_LOCAL(state, res) {
    state.manageMusicListRes = res
    state.musicListMap = getMusicListMap()
    //console.log('state.manageMusicListRes', state.manageMusicListRes)
  },
  DEL_MUSIC_LIST(state, {platform, id}) {
    //让map重新更新
    delMusicList(platform, id)
    state.musicListMap = getMusicListMap()
  },


  // 添加歌曲到歌单
  ADD_MUSIC_TO_CUSTOM_LIST(state, res) {
    state.manageMusicListRes = res
    state.musicListMap = getMusicListMap()
  },


  SET_MANAGE_MUSIC_LIST_RES(state, flag) {
    state.manageMusicListRes = flag
  },

  SET_AUTO_SEARCH_AUDIO_SOURCE(state, flag) {
    state.autoSearchAudioSource = flag
  },

  SET_USE_BIND_AUDIO(state, flag) {
    state.useBindAudio = flag
  },

  SET_SONGS_AUDIO_CANDIDATES(state, newCandidates) {
    state.songsAudioCandidates = newCandidates
  }

}

export default mutations
