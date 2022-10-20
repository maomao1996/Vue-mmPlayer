import axios from '@/utils/axios'
import { defaultLimit } from '@/config'
import { formatTopSongs } from '@/utils/song'

// axios.defaults.baseURL = process.env.VUE_APP_BASE_API_URL

// 排行榜列表
export function getToplistDetail() {
  return axios.get('/toplist/detail')
}

// 推荐歌单
export function getPersonalized() {
  return axios.get('/personalized')
}

// 歌单详情
export function getPlaylistDetail(id) {
  return new Promise((resolve, reject) => {
    axios
      .get('/playlist/detail', {
        params: { id }
      })
      .then(({ playlist }) => playlist || {})
      .then(playlist => {
        const { trackIds, tracks } = playlist
        if (!Array.isArray(trackIds)) {
          reject(new Error('获取歌单详情失败'))
          return
        }
        // 过滤完整歌单 如排行榜
        if (tracks.length === trackIds.length) {
          playlist.tracks = formatTopSongs(playlist.tracks)
          resolve(playlist)
          return
        }
        // 限制歌单详情最大 500
        const ids = trackIds
          .slice(0, 500)
          .map(v => v.id)
          .toString()
        getMusicDetail(ids).then(({ songs }) => {
          playlist.tracks = formatTopSongs(songs)
          resolve(playlist)
        })
      })
  })
}

// 搜索
export function search(keywords, page = 0, limit = defaultLimit) {
  return axios.get('/search', {
    params: {
      offset: page * limit,
      limit: limit,
      keywords
    }
  })
}

// 热搜
export function searchHot() {
  return axios.get('/search/hot')
}

// 获取用户歌单详情
export function getUserPlaylist(uid) {
  return axios.get('/user/playlist', {
    params: {
      uid
    }
  })
}

// 获取歌曲详情
export function getMusicDetail(ids) {
  return axios.get('/song/detail', {
    params: {
      ids
    }
  })
}

// 获取音乐是否可以用
export function getCheckMusic(id) {
  return axios.get('/check/music', {
    params: {
      id
    }
  })
}

// 获取音乐地址
export function getMusicUrl(id) {
  return axios.get('/song/url', {
    params: {
      id
    }
  })
}

// 获取歌词
export function getLyric(id) {
  const url = '/lyric'
  return axios.get(url, {
    params: {
      id
    }
  })
}

// 获取音乐评论
export function getComment(id, page, limit = defaultLimit) {
  return axios.get('/comment/music', {
    params: {
      offset: page * limit,
      limit: limit,
      id
    }
  })
}

// 手机号登录
export function phoneLogin({ phone, password }) {
  return axios.get('/login/cellphone', {
    params: {
      phone,
      password,
      realIP: '116.25.146.177'
    }
  })
}

// 邮箱登录
export function emailLogin({ email, password }) {
  return axios.get('/login/email', {
    params: {
      email,
      password
    }
  })
}

// 退出登录
export function logout() {
  return axios.post('/logout')
}

// 获取云盘歌曲URL
export function getCloudMusicUrl(id) {
  return axios({
    method: 'GET',
    url: '/song/url',
    params: { id, timestamp: Date.now(), cookie: encodeURIComponent(localStorage.getItem('cookie') || '') }
  })
}

// 获取云盘歌曲详情
export function getCloudMusicDetail(id) {
  return axios({
    method: 'GET',
    url: '/user/cloud/detail',
    params: { id, timestamp: Date.now(), cookie: encodeURIComponent(localStorage.getItem('cookie') || '') }
  })
}

// 获取云盘歌曲列表
export function getCloudPlaylist() {
  return new Promise(async(resolve, reject) => {
    try {
      let { data: playlist } = await axios({
        method: 'POST',
        url: '/user/cloud',
        data: { limit: 500, cookie: encodeURIComponent(localStorage.getItem('cookie') || '') },
        params: { timestamp: Date.now(), realIP: '116.25.146.177' }
      })
      if (!Array.isArray(playlist)) {
        reject(new Error('获取歌单详情失败'))
        return
      }
      if (playlist.length === 0) {
        reject(new Error('歌单为空'))
        return
      }
      // 限制歌单详情最大 500
      const ids = playlist
        .slice(0, 500)
        .map(v => v.songId)
        .toString()
      getCloudMusicDetail(ids)
      let { data: urlsDetail } = await getCloudMusicUrl(ids)
      let temp = {}
      urlsDetail.forEach(({ id, time, url }, index) => {
        temp = playlist.find(song => song.songId === id)
        Object.assign(temp, { time, url })
      })
      playlist = playlist.map(song => {
        return {
          album: song.album,
          duration: song.time / 1000,
          id: song.songId,
          image: `http://p1.music.126.net/aXUPgImt8hhf4cMUZEjP4g==/109951165611417794.jpg?param=40y40`,
          name: song.songName,
          singer: song.artist,
          url: song.url
        }
      })
      resolve(playlist)
    } catch (error) {
      reject(error)
    }
  })
}
