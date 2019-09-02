import {
  clearHistoryList,
  setHistoryList,
  removeHistoryList,
  setMode,
  setUserId
} from '@/utils/storage'
import * as types from './mutation-types'

function findIndex(list, music) {
  return list.findIndex(item => {
    return item.id === music.id
  })
}

// 设置播放列表
export const setPlaylist = function({ commit }, { list }) {
  commit(types.SET_PLAYLIST, list)
  commit(types.SET_ORDERLIST, list)
}

// 选择播放（会更新整个播放列表）
export const selectPlay = function({ commit }, { list, index }) {
  commit(types.SET_PLAYLIST, list)
  commit(types.SET_ORDERLIST, list)
  commit(types.SET_CURRENTINDEX, index)
  commit(types.SET_PLAYING, true)
}
// 选择播放（会插入一条到播放列表）
export const selectAddPlay = function({ commit, state }, music) {
  let list = [...state.playlist]
  // 查询当前播放列表是否有代插入的音乐，并返回其索引值
  let index = findIndex(list, music)
  // 当前播放列表有待插入的音乐时，直接改变当前播放音乐的索引值
  if (index > -1) {
    commit(types.SET_CURRENTINDEX, index)
  } else {
    list.unshift(music)
    commit(types.SET_PLAYLIST, list)
    commit(types.SET_ORDERLIST, list)
    commit(types.SET_CURRENTINDEX, 0)
  }
  commit(types.SET_PLAYING, true)
}

// 清空播放列表
export const clearPlayList = function({ commit }) {
  commit(types.SET_PLAYING, false)
  commit(types.SET_CURRENTINDEX, -1)
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_ORDERLIST, [])
}

// 删除正在播放列表中的歌曲
export const removerPlayListItem = function(
  { commit, state },
  { list, index }
) {
  let currentIndex = state.currentIndex
  if (index < state.currentIndex || list.length === state.currentIndex) {
    currentIndex--
    commit(types.SET_CURRENTINDEX, currentIndex)
  }
  commit(types.SET_PLAYLIST, list)
  commit(types.SET_ORDERLIST, list)
  if (!list.length) {
    commit(types.SET_PLAYING, false)
  } else {
    commit(types.SET_PLAYING, true)
  }
}
// 设置播放历史
export const setHistory = function({ commit }, music) {
  commit(types.SET_HISTORYLIST, setHistoryList(music))
}
// 删除播放历史
export const removeHistory = function({ commit }, music) {
  commit(types.SET_HISTORYLIST, removeHistoryList(music))
}
// 清空播放历史
export const clearHistory = function({ commit }) {
  commit(types.SET_HISTORYLIST, clearHistoryList())
}
// 设置播放模式
export const setPlayMode = function({ commit }, mode) {
  commit(types.SET_PLAYMODE, setMode(mode))
}
// 设置网易云用户UID
export const setUid = function({ commit }, uid) {
  commit(types.SET_UID, setUserId(uid))
}
