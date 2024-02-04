import {request as axios, axiosOrigin} from '@/utils/axios'
import { DEFAULT_LIMIT } from '@/config'
import { formatSongs } from '@/utils/song'
import {request} from "@/utils/axios";

// 排行榜列表
export function getToplistDetail() {
  return axios.get('/toplist/detail')
}

// 推荐歌单
export function getPersonalized() {
  return axios.get('/personalized')
}

// 歌单详情
// origin
export function getPlaylistDetail(id) {
  return new Promise((resolve, reject) => {
    axios
      .get('/playlist/detail', {
        params: { id },
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
// export function getPlaylistDetail(id) {
//   return new Promise((resolve, reject) => {
//
//   })
// }

// 搜索
export function search(keywords, page = 0, limit = DEFAULT_LIMIT) {
  return axios.get('/search', {
    params: {
      offset: page * limit,
      limit: limit,
      keywords,
    },
  })
}

// 热搜
export function searchHot() {
  return axios.get('/search/hot')
}

// 搜索b站视频
export function searchVideoResources(musicName, singer) {
  // return axiosOrigin.get('http://123.57.92.107:9090/music-get/getMusic/SearchMusicResources/20', {
  return axiosOrigin.get('/music-get/getMusic/SearchMusicResources/20', {
    params: {
      musicName,
      singer: ''
    }
  })
}
// 获取视频音频
export function getAudioUrl(bvid) {
  // return axiosOrigin.get(`http://123.57.92.107:9090/music-get/getMusic/getMusicUrl/${bvid}`, {
  return axiosOrigin.get(`/music-get/getMusic/getMusicUrl/${bvid}`, {
    params: {
      musicName: 'bvid',
      singer: ''
    },
  })
}

// 获取用户歌单详情
export function getUserPlaylist(uid) {
  return axios.get('/user/playlist', {
    params: {
      uid,
    },
  })
}

// 获取歌曲详情
export function getMusicDetail(ids) {
  return axios.get('/song/detail', {
    params: {
      ids,
    },
  })
}

// 获取音乐是否可以用
export function getCheckMusic(id) {
  return axios.get('/check/music', {
    params: {
      id,
    },
  })
}

// 获取音乐地址
export function getMusicUrl(id) {
  return axios.get('/song/url', {
    params: {
      id,
    },
  })
}

// 获取歌词
export function getLyric(id) {
  const url = '/lyric'
  return axios.get(url, {
    params: {
      id,
    },
  })
}

// 获取音乐评论
export function getComment(id, page, limit = DEFAULT_LIMIT) {
  return axios.get('/comment/music', {
    params: {
      offset: page * limit,
      limit: limit,
      id,
    },
  })
}
