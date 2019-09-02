import { playMode } from '@/config'
import { getHistoryList, getMode, getUserId } from '@/utils/storage'

const state = {
  audioEle: null, // audio元素
  mode: Number(getMode()) || playMode.listLoop, // 播放模式，默认列表循环
  playing: false, // 播放状态
  playlist: [], // 播放列表
  orderList: [], // 顺序列表
  currentIndex: -1, // 当前音乐索引
  historyList: getHistoryList() || [], // 播放历史列表
  uid: getUserId() || null // 网易云用户UID
}

export default state
