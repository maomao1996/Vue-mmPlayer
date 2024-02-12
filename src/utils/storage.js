import {MMPLAYER_CONFIG} from '@/config'

const STORAGE = window.localStorage
// 这个storage必须是数组类型??不能是Map??如果是map,可以提高搜索效率
const storage = {
  get(key, data = []) {
    if (STORAGE) {
      /*
      其中
      Array.isArray(data)
          ? JSON.parse(STORAGE.getItem(key))
          : STORAGE.getItem(key)
      和data同属于STORAGE.getItem(key)的选项.类似:
       const a = 1,m=0,x=10,y=20,c=2
       console.log(a?(m?x:y):c)
      */
      return STORAGE.getItem(key)
        ? Array.isArray(data)
          ? JSON.parse(STORAGE.getItem(key))
          : STORAGE.getItem(key)
        : data
    }
  },
  set(key, val) {
    if (STORAGE) {
      STORAGE.setItem(key, val)
    }
  },
  clear(key) {
    if (STORAGE) {
      STORAGE.removeItem(key)
    }
  },
}

/**
 * 在线音乐歌单
 * 1. 歌单主要保存在本地. 由于localStorage最多5MB,所以歌曲只能保存3k首,其它空间留着其它用
 * 2. 用户可以手动点击同步, 上传服务器. 同步的歌单可以从本地删除, 需要时再同步下来.
 * 3. 提供两种同步方式, 一种同步只能用于听, 另一种同步可以编辑歌单, 但是需要保证本地有足够空闲空间
 */
const LOCAL_LIST_NUM = 2 //歌单数量上线
const LOCAL_LIST_CONTAIN = 3 //单个歌单最大容量
const MUSIC_LIST_HEAD = '__music_list__'

/**
 * 歌单管理
 */
// 获取所有歌单
export function getMusicListMap() {
  console.log('getMusicListMap().....')
  return storage.get(MUSIC_LIST_HEAD)
}
// 创建歌单
export function setCustomListMap(platform, id, listName='') {
  const map = storage.get(MUSIC_LIST_HEAD)
  if (map.length >= LOCAL_LIST_NUM) {
    // 歌单数量到达上线
    return ''
  }
  // console.log('map===,',map)
  // id自动从1开始累加,如果中间删除歌单,后续歌单id不会变,依旧累加

  const customListStorageKey = MUSIC_LIST_HEAD + id
  // console.log('id====',id)
  map.unshift({listName, id: id})
  storage.set(MUSIC_LIST_HEAD, JSON.stringify(map))
  return customListStorageKey
}
// 删除歌单
export function delCustomListMap(id) {
  // 删除歌单
  const customListStorageKey = MUSIC_LIST_HEAD + id
  storage.clear(customListStorageKey)
  // 删除歌单映射表中的对应记录
  const map = storage.get(MUSIC_LIST_HEAD)
  console.log('cleared musicList')
  const index = map.findIndex((item) => {
    return item.id === parseInt(id)
  })
  console.log('to del item, index = ', index)
  map.splice(index, 1)
  storage.set(MUSIC_LIST_HEAD, JSON.stringify(map))
  return true
}
/*// 通过歌单名称获取存储歌单的key -- del
export function getCustomListStorageKey(listName) {
  const map = storage.get(MUSIC_LIST_HEAD)
  const index = map.findIndex((item) => {
    return item.listName === listName
  })
  if (index < 0) {
    // 不存在该歌单
    return ''
  }
  return MUSIC_LIST_HEAD + map[index].id
}*/

/**
 * 其它平台歌单
 */
// 导入其它平台歌单
export function addOtherMusicList(platform, id) {
  console.log('addOtherMusicList')
  const map = storage.get(MUSIC_LIST_HEAD)
  // console.log('map===,',map)
  // console.log('id====',id)
  map.unshift({platform, id})
  storage.set(MUSIC_LIST_HEAD, JSON.stringify(map))
}

/**
 * 单个歌单管理
 */
export function setMusicListInfo(id, musicListInfo) {

}
export function setCustomList(listName, music, id='') {
  // console.log('existsList', customList)
  let customListStorageKey = MUSIC_LIST_HEAD + 'custom_' + id
  if (id === '') {
    console.log('musicList not exists, now create !!!!!!!!')
    // 创建歌单并更新到map中
    //1.先更新到map中, 可以知道是否超过10个歌单
    customListStorageKey = setCustomListMap(listName)
    if (customListStorageKey === '') {
      // 歌单创建失败, 可能是存在或到达上线
      console.log('歌单创建失败, 到达上线')
      return 2
    }
    console.log(customListStorageKey)
    const customList = []
    customList.unshift(music)
    // console.log('customList====', customList)
    // console.log('music====', music)
    storage.set(customListStorageKey, JSON.stringify(customList))
    console.log("5135125342")
    return 0
  } else {
    // 歌单存在直接添加music
    console.log('歌单存在直接添加music')
    const customList = storage.get(customListStorageKey)
    const index = customList.findIndex(item => {
      return item.id === music.id
    })
    if (customList.length >= LOCAL_LIST_CONTAIN || index > -1) {
      console.log('music  exists!!!!!!!!!! 或 歌曲数量到达上线')
      return 3
    }
    customList.unshift(music)
    storage.set(customListStorageKey, JSON.stringify(customList))
    console.log('111111111 歌单存在直接添加music')
    return 1
  }
}
export function getCustomList (id) {
  const customListStorageKey = MUSIC_LIST_HEAD + id
  return storage.get(customListStorageKey)
}
export function removeCustomList (id, newCustomList) {
  const customListStorageKey = MUSIC_LIST_HEAD + id
  storage.set(customListStorageKey, JSON.stringify(newCustomList))
}

/**
 * 播放历史
 * @type    HISTORYLIST_KEY：key值
 *          HistoryListMAX：最大长度
 */
const HISTORYLIST_KEY = '__mmPlayer_historyList__'
const HistoryListMAX = 200

// 获取播放历史
export function getHistoryList() {
  return storage.get(HISTORYLIST_KEY)
}

// 更新播放历史
export function setHistoryList(music) {
  let list = storage.get(HISTORYLIST_KEY)
  const index = list.findIndex((item) => {
    return item.id === music.id
  })
  if (index === 0) {
    return list
  }
  if (index > 0) {
    list.splice(index, 1)
  }
  list.unshift(music)
  if (HistoryListMAX && list.length > HistoryListMAX) {
    list.pop()
  }
  storage.set(HISTORYLIST_KEY, JSON.stringify(list))
  return list
}

// 删除一条播放历史
export function removeHistoryList(music) {
  storage.set(HISTORYLIST_KEY, JSON.stringify(music))
  return music
}

// 清空播放历史
export function clearHistoryList() {
  storage.clear(HISTORYLIST_KEY)
  return []
}

/**
 * 播放模式
 * @type    MODE_KEY：key值
 */
const MODE_KEY = '__mmPlayer_mode__'

// 获取播放模式
export function getMode() {
  return Number(storage.get(MODE_KEY, MMPLAYER_CONFIG.PLAY_MODE))
}

// 修改播放模式
export function setMode(mode) {
  storage.set(MODE_KEY, mode)
  return mode
}

/**
 * 网易云用户uid
 * @type USERID_KEY：key值
 */
const USERID_KEY = '__mmPlayer_userID__'

// 获取用户uid
export function getUserId() {
  return Number(storage.get(USERID_KEY, null))
}

// 修改用户uid
export function setUserId(uid) {
  storage.set(USERID_KEY, uid)
  return uid
}

/**
 * 版本号
 * @type VERSION_KEY：key值
 */
const VERSION_KEY = '__mmPlayer_version__'

// 获取版本号
export function getVersion() {
  let version = storage.get(VERSION_KEY, null)
  return Array.isArray(version) ? null : version
}

// 修改版本号
export function setVersion(version) {
  storage.set(VERSION_KEY, version)
  return version
}

/**
 * 音量
 * @type VOLUME_KEY：key值
 */
const VOLUME_KEY = '__mmPlayer_volume__'

// 获取音量
export function getVolume() {
  const volume = storage.get(VOLUME_KEY, MMPLAYER_CONFIG.VOLUME)
  return Number(volume)
}

// 修改音量
export function setVolume(volume) {
  storage.set(VOLUME_KEY, volume)
  return volume
}
