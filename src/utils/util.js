// 随机排序数组/洗牌函数 https://github.com/lodash/lodash/blob/master/shuffle.js
function copyArray(source, array) {
  let index = -1
  const length = source.length
  array || (array = new Array(length))
  while (++index < length) {
    array[index] = source[index]
  }
  return array
}

export const randomSortArray = function shuffle(array) {
  const length = array == null ? 0 : array.length
  if (!length) {
    return []
  }
  let index = -1
  const lastIndex = length - 1
  const result = copyArray(array)
  while (++index < length) {
    const rand = index + Math.floor(Math.random() * (lastIndex - index + 1))
    const value = result[rand]
    result[rand] = result[index]
    result[index] = value
  }
  return result
}

// 防抖函数
export function debounce(func, delay) {
  let timer
  return function(...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

// 补0函数
export function addZero(s) {
  return s < 10 ? '0' + s : s
}

// 歌词解析
const timeExp = /\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g
export function parseLyric(lrc) {
  const lines = lrc.split('\n')
  const lyric = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const result = timeExp.exec(line)
    if (!result) {
      continue
    }
    const text = line.replace(timeExp, '').trim()
    if (text) {
      lyric.push({
        time: (result[1] * 6e4 + result[2] * 1e3 + (result[3] || 0) * 1) / 1e3,
        text
      })
    }
  }
  return lyric
}

// 时间格式化
export function format(value) {
  let minute = Math.floor(value / 60)
  let second = Math.floor(value % 60)
  return `${addZero(minute)}:${addZero(second)}`
}

/**
 * https://github.com/videojs/video.js/blob/master/src/js/utils/promise.js
 * Silence a Promise-like object.
 *
 * This is useful for avoiding non-harmful, but potentially confusing "uncaught
 * play promise" rejection error messages.
 *
 * @param  {Object} value
 *         An object that may or may not be `Promise`-like.
 */
export function isPromise(v) {
  return v !== undefined && v !== null && typeof v.then === 'function'
}

export function silencePromise(value) {
  if (isPromise(value)) {
    value.then(null, () => {})
  }
}

// 判断 string 类型
export function isString(v) {
  return typeof v === 'string'
}

// http 链接转化成 https
export function toHttps(url) {
  if (!isString(url)) {
    return url
  }
  return url.replace('http://', 'https://')
}
