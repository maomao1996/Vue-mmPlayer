import {getMusicListMap, getHistoryList, getMode, getUserId} from '@/utils/storage'

const state = {
  audioEle: null, // audio元素
  mode: getMode(), // 播放模式，默认列表循环
  playing: false, // 播放状态
  playlist: [], // 播放列表
  orderList: [], // 顺序列表
  currentIndex: -1, // 当前音乐索引
  historyList: getHistoryList() || [], // 播放历史列表
  uid: getUserId() || null, // 网易云用户UID,
  commentOpen: false,
  searchAudio: null,
  manageCustomMusicListRes: '',
  customListId: -1,
  //正在查询的歌单内容, 放进vuex可以做到用户向正在查询的歌单添加歌曲时,实时展现更新.
  customMusicList: [],   // 这里设置为[]表示不存在歌单. 因为删除歌曲到0首时会自动删除歌单
  musicListMap: getMusicListMap() || [],
}

export default state
