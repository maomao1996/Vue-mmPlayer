import axios from '@/utils/axios'
import { DEFAULT_LIMIT } from '@/config'
import { formatSongs } from '@/utils/song'
import qs from 'qs'
// 排行榜列表
export function getToplistDetail() {
  return axios.get('/toplist/detail')
}

// 推荐歌单
export function getPersonalized() {
  return axios.get('/personalized')
}

export function getRandomPlaylistDetail() {
  const param = {
    limit: 100,
    method: 'list',
    library: 'shared',
    api: 'SYNO.AudioStation.Song',
    additional: 'song_tag,song_audio,song_rating',
    sort_by: 'random',
    version: 3
  }
  const url = `/webapi/AudioStation/song.cgi?${qs.stringify(param)}`
  return axios.get(url)
}

export function setMusicScore(id, rating) {
  const param = {
    rating: rating,
    method: 'setrating',
    id: id,
    api: 'SYNO.AudioStation.Song',
    version: 3
  }
  const url = `/webapi/AudioStation/song.cgi?${qs.stringify(param)}`
  return axios.get(url)
}
export function loginSYNO(username, password) {
  const param = {
    api: 'SYNO.API.Auth',
    version: '7',
    method: 'login',
    account: username,
    passwd: password
  }
  const url = `webapi/entry.cgi?${qs.stringify(param)}`
  return axios.get(url)
}
// 获取歌词
export function getSYNOLyric(id) {
  const param = {
    id,
    method: 'getlyrics',
    library: 'shared',
    api: 'SYNO.AudioStation.Lyrics',
    version: 2
  }
  const url = `/webapi/AudioStation/lyrics.cgi?${qs.stringify(param)}`
  return axios.get(url)
}

// 歌单详情
export function getPlaylistDetail(id) {
  return new Promise((resolve, reject) => {
    axios
      .get('/playlist/detail', {
        params: { id }
      })
      .then(({ playlist }) => playlist || {})
      .then((playlist) => {
        const { trackIds, tracks } = playlist
        if (!Array.isArray(trackIds)) {
          reject(new Error('获取歌单详情失败'))
          return
        }
        // 过滤完整歌单 如排行榜
        if (tracks.length === trackIds.length) {
          playlist.tracks = formatSongs(playlist.tracks)
          resolve(playlist)
          return
        }
        // 限制歌单详情最大 500
        const ids = trackIds
          .slice(0, 500)
          .map((v) => v.id)
          .toString()
        getMusicDetail(ids).then(({ songs }) => {
          playlist.tracks = formatSongs(songs)
          resolve(playlist)
        })
      })
  })
}

// 搜索
export function search(keywords, page = 0, limit = DEFAULT_LIMIT) {
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
export function getComment(id, page, limit = DEFAULT_LIMIT) {
  return axios.get('/comment/music', {
    params: {
      offset: page * limit,
      limit: limit,
      id
    }
  })
}
