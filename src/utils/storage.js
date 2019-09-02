import { defaultVolume } from '@/config'

const _storage = window.localStorage
const storage = {
  get(key, data = []) {
    if (_storage) {
      return _storage.getItem(key)
        ? Array.isArray(data)
          ? JSON.parse(_storage.getItem(key))
          : _storage.getItem(key)
        : data
    }
  },
  set(key, val) {
    if (_storage) {
      _storage.setItem(key, val)
    }
  },
  clear(key) {
    if (_storage) {
      _storage.removeItem(key)
    }
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
  const index = list.findIndex(item => {
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
 *          HistoryListMAX：最大长度
 */
const MODE_KEY = '__mmPlayer_mode__'
// 获取播放模式
export function getMode() {
  return storage.get(MODE_KEY, null)
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
  const volume = storage.get(VOLUME_KEY, defaultVolume)
  return Number(volume)
}
// 修改音量
export function setVolume(volume) {
  storage.set(VOLUME_KEY, volume)
  return volume
}
