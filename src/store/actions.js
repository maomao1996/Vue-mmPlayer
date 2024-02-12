import {
  clearHistoryList,
  setCustomList,
  setHistoryList,
  removeHistoryList,
  setMode,
  setUserId, removeCustomList, delCustomListMap, setMusicListInfo, addOtherMusicList,
} from '@/utils/storage'
import * as types from './mutation-types'

function findIndex(list, music) {
  return list.findIndex((item) => {
    return item.id === music.id
  })
}

// 设置播放列表
export const setPlaylist = function ({ commit }, { list }) {
  commit(types.SET_PLAYLIST, list)
  commit(types.SET_ORDERLIST, list)
}

// 选择播放（会更新整个播放列表）
export const selectPlay = function ({ commit }, { list, index }) {
  commit(types.SET_PLAYLIST, list)
  commit(types.SET_ORDERLIST, list)
  commit(types.SET_CURRENTINDEX, index)
  commit(types.SET_PLAYING, true)
}
// 选择播放（会插入一条到播放列表）
export const selectAddPlay = function ({ commit, state }, music) {
  let list = [...state.playlist]
  // 查询当前播放列表是否有代插入的音乐，并返回其索引值
  let index = findIndex(list, music)
  // 当前播放列表有待插入的音乐时，直接改变当前播放音乐的索引值
  if (index > -1) {
    console.log("!!!!!!!!!!!")
    commit(types.SET_CURRENTINDEX, index)
  } else {
    console.log("!222222222!!!!!!!!!!")
    list.unshift(music)
    commit(types.SET_PLAYLIST, list)
    commit(types.SET_ORDERLIST, list)
    commit(types.SET_CURRENTINDEX, 0)
  }
  commit(types.SET_PLAYING, true)
}

// 清空播放列表
export const clearPlayList = function ({ commit }) {
  commit(types.SET_PLAYING, false)
  commit(types.SET_CURRENTINDEX, -1)
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_ORDERLIST, [])
}

// 删除正在播放列表中的歌曲
//@TODO 这里会改变currentMusic,就会触发music.vue中的watch.但是为什么这里修改currentIndex后没有立刻触发watch??
export const removerPlayListItem = function ({ commit, state }, { list, index }) {
  let currentIndex = state.currentIndex
  if (index < state.currentIndex || list.length === state.currentIndex) {
    currentIndex--
    commit(types.SET_CURRENTINDEX, currentIndex)
  }
  commit(types.SET_PLAYLIST, list)
  commit(types.SET_ORDERLIST, list)
  console.log('action 修改了playlist')
  if (!list.length) {
    commit(types.SET_PLAYING, false)
  } else {
    commit(types.SET_PLAYING, true)
  }
}
// 设置播放历史
export const setHistory = function ({ commit }, music) {
  commit(types.SET_HISTORYLIST, setHistoryList(music))
}
// 删除播放历史
export const removeHistory = function ({ commit }, music) {
  commit(types.SET_HISTORYLIST, removeHistoryList(music))
}
// 清空播放历史
export const clearHistory = function ({ commit }) {
  commit(types.SET_HISTORYLIST, clearHistoryList())
}
// 设置播放模式
export const setPlayMode = function ({ commit }, mode) {
  commit(types.SET_PLAYMODE, setMode(mode))
}
// 设置网易云用户UID
export const setUid = function ({ commit }, uid) {
  commit(types.SET_UID, setUserId(uid))
}
// 添加歌曲到歌单
export const setCustomMusicList = function ({commit}, {listName, music, customListStorageKeyTail}) {
  // console.log("action setCustomMusicList")
  // console.log(listName)
  // console.log(music)
  commit('SET_CUSTOM_LIST', setCustomList(listName, music, customListStorageKeyTail))
}
// 设置查询的歌单id,之后通过getter()获取歌单详情. 如果直接在action()中调用getCustomList(id), 就不能做到监听
export const setCustomMusicListId = function ({commit}, customMusicListId) {
  // console.log("action setCustomMusicList")
  // console.log(listName)
  // console.log(music)
  console.log('tetsteta setCustomMusicListId')
  commit('SET_CUSTOM_LIST_ID', customMusicListId)
}

// 删除歌单中的单曲
export const delSongFromCustomMusicListById = function ({commit}, {id, newList}) {
  // removeCustomList(id, newList)
  removeCustomList(id, newList)
  commit('DEL_SONG_FROM_CUSTOM_LIST', newList)
}
// 删除整个歌单
export const delCustomMusicList = function ({commit}, id) {
  //console.log('1212414214123sfg')
  commit('DEL_CUSTOM_LIST', delCustomListMap(id))
}
// 添加歌单信息(导入其它平台歌单)
export const addOtherPlatformMusicList = function ({commit}, {id, listName}) {
  console.log('1212414214123sfg')
  addOtherMusicList(id, listName)
  commit('ADD_OTHER_PLATFORM_MUSIC_LIST', 'import success')
}
