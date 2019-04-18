import axios from 'axios'
import { URL, defaultLimit } from '@/config'

axios.defaults.baseURL = URL

// 排行榜列表
export function getToplistDetail () {
  return axios.get('/toplist/detail')
}

// 排行榜详情
export function topList (idx) {
  return axios.get('/top/list', {
    params: {
      idx
    }
  })
}

// 推荐歌单
export function getPersonalized () {
  return axios.get('/personalized')
}

// 歌单详情
export function getPlaylistDetail (id) {
  return axios.get('/playlist/detail', {
    params: {
      id
    }
  })
}

// 搜索
export function search (keywords, page = 0, limit = defaultLimit) {
  return axios.get('/search', {
    params: {
      offset: page * limit,
      limit: limit,
      keywords
    }
  })
}

// 热搜
export function searchHot () {
  return axios.get('/search/hot')
}

// 获取用户歌单详情
export function getUserPlaylist (uid) {
  return axios.get('/user/playlist', {
    params: {
      uid
    }
  })
}

// 获取歌曲详情
export function getMusicDetail (ids) {
  return axios.get('/song/detail', {
    params: {
      ids
    }
  })
}

// 获取音乐是否可以用
export function getCheckMusic (id) {
  return axios.get('/check/music', {
    params: {
      id
    }
  })
}

// 获取音乐地址
export function getMusicUrl (id) {
  return axios.get('/song/url', {
    params: {
      id
    }
  })
}

// 获取歌词
export function getLyric (id) {
  const url = '/lyric'
  return axios.get(url, {
    params: {
      id
    }
  })
}

// 获取音乐评论
export function getComment (id, page, limit = defaultLimit) {
  return axios.get('/comment/music', {
    params: {
      offset: page * limit,
      limit: limit,
      id
    }
  })
}
