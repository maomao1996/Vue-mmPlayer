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
       //console.log(a?(m?x:y):c)
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
const LOCAL_LIST_NUM = 10 //歌单数量上线
const LOCAL_LIST_CONTAIN = 300 //单个歌单最大容量
const MUSIC_LIST_HEAD = '__music_list__'

/**
 * 歌单管理
 */
// 获取所有歌单
export function getMusicListMap() {
  //console.log('getMusicListMap().....')
  return storage.get(MUSIC_LIST_HEAD)
}

// 创建歌单
export function addMusicList(musicListInfo) {
  const map = storage.get(MUSIC_LIST_HEAD)
  //console.log('musicListInfo===,',musicListInfo)
  let customListCount = 0
  map.forEach(item => {
    item.platform === 'custom' ? customListCount++ : ''
  })
  if (customListCount >= LOCAL_LIST_NUM) {
    return false
  }
  // ((map.length > 0 && map[0].id) || 0) + 1
  // //console.log('id====',id)
  map.unshift(musicListInfo)
  storage.set(MUSIC_LIST_HEAD, JSON.stringify(map))
  return true
}

// 删除歌单
export function delMusicList(platform, id) {
  // 删除本地歌单表
  if (platform === 'custom') {
    const customListStorageId = MUSIC_LIST_HEAD + 'custom_' + id
    storage.clear(customListStorageId)
  }
  // 删除歌单映射表中的对应记录
  const map = storage.get(MUSIC_LIST_HEAD)
  //console.log('cleared musicList')
  const index = map.findIndex((item) => {
    return item.id === parseInt(id)
  })
  //console.log('to del item, index = ', index)
  map.splice(index, 1)
  storage.set(MUSIC_LIST_HEAD, JSON.stringify(map))
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

// 如果歌单不存在,调用者要先去添加到map,这里只负责操作歌单数据表.不负责映射表内容的创建
export function addSongToCustomList(music, id) {
  // //console.log('existsList', customList)
  let customListStorageId = MUSIC_LIST_HEAD + 'custom_' + id
  //console.log('customListStorageId , ', customListStorageId)
  const customList = storage.get(customListStorageId)
  //调用者暂时没有获取该歌单数据, 所以只能在这里判断重复和容量
  if (customList.length >= LOCAL_LIST_CONTAIN) {
    //console.log('歌曲数量到达上线')
    return false
  }
  const index = customList.findIndex(item => {
    return item.id === music.id
  })
  if (index > -1) {
    //console.log('music exists !!!!! ')
    return false
  }
  customList.unshift(music)
  // //console.log('customList====', customList)
  // //console.log('music====', music)
  storage.set(customListStorageId, JSON.stringify(customList))
  return true
}

export function getCustomList(id) {
  const customListStorageId = MUSIC_LIST_HEAD + 'custom_' + id
  return storage.get(customListStorageId)
}

export function removeSongFromCustomList(id, newCustomList) {
  const customListStorageId = MUSIC_LIST_HEAD + 'custom_' + id
  storage.set(customListStorageId, JSON.stringify(newCustomList))
}

const BIND_INFO_COUNT = 3;
const BIND_INFO_KEY = '__bind_info__'
export function addBindInfo(songId, audioInfo) {
  const bindList = storage.get(BIND_INFO_KEY)
  let count = 0;
  bindList.forEach(item => {
    if (item.songId === songId)
      // 已经存在该songId的绑定
      return false
    count++;
  })
  if (count >= BIND_INFO_COUNT) {
    //本地数据过多
    return false
  }
  bindList.unshift({songId, audioInfo})
  storage.set(BIND_INFO_KEY, JSON.stringify(bindList))
  return true;
}
export function getBindInfo(songId) {
  const bindList = storage.get(BIND_INFO_KEY)
  let count = 0;
  const index = bindList.findIndex(item => {
    return item.songId === songId
  })
  if (index > -1) {
    return bindList[index];
  } else {
    return null;
  }
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
