import * as types from './mutation-types'
import {getMusicListMap} from "@/utils/storage";

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
    state.playing = playing
  },
  // 修改播放列表
  [types.SET_PLAYLIST](state, playlist) {
    console.log('mutation 修改playlist')
    state.playlist = playlist
  },
  // 修改顺序列表
  [types.SET_ORDERLIST](state, orderList) {
    state.orderList = orderList
  },
  // 修改当前音乐索引
  [types.SET_CURRENTINDEX](state, currentIndex) {
    console.log('mutation 修改当前音乐索引')
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
  SET_SEARCH_AUDIO(state, targetMusic= null) {
    state.searchAudio = targetMusic
  },
  // 点击播放时, 需要为当前song添加urls
  SET_MUSIC_AUDIO_URLS(state, urls) {
    state.playlist[state.currentIndex].audioSource.urls = urls
  },

  // 添加歌曲到歌单
  SET_CUSTOM_LIST(state, result) {
    if (result === 1) {
      state.manageCustomMusicListRes = 'success'
    } else if (result === 0) {
      state.manageCustomMusicListRes = '新建歌单success'
      //让map重新更新
      state.musicListMap = getMusicListMap()
    } else if (result === 2) {
      state.manageCustomMusicListRes = '新建歌单失败, 歌单数量到达上限'
    } else if (result === 3) {
      state.manageCustomMusicListRes = 'music  exists 或 歌曲数量到达上限'
    }
    console.log( 'SET_CUSTOM_LIST ',state.manageCustomMusicListRes)
  },
  // 查询歌单详情
  SET_CUSTOM_LIST_ID(state, customMusicListId) {
    console.log('mutation SET_CUSTOM_LIST_ID')
    state.customListId = customMusicListId
  },
  DEL_SONG_FROM_CUSTOM_LIST(state, newList) {
    state.customMusicList = newList
    state.manageCustomMusicListRes = '删除单曲成功'
  },
  DEL_CUSTOM_LIST(state, res) {
    //让map重新更新
    console.log('DEL_CUSTOM_LIST, res=', res)
    state.musicListMap = getMusicListMap()
    state.manageCustomMusicListRes = '删除歌单成功'
  },

  ADD_OTHER_PLATFORM_MUSIC_LIST(state, message) {
    console.log('ADD_OTHER_PLATFORM_MUSIC_LIST, message=', message)
    //让map重新更新
    state.musicListMap = getMusicListMap()
    state.manageCustomMusicListRes = message
  },
}

export default mutations
