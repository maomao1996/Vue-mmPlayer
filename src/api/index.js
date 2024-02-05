import {neteaseAxios, request as axios, axiosOrigin} from '@/utils/axios'
import {DEFAULT_LIMIT} from '@/config'
import {formatSongs} from '@/utils/song'

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
// 网易云服务器禁止了跨域,所以这种让前端向网易云发请求的方式不行
/*export function getPlaylistDetail(id) {
  return new Promise((resolve, reject) => {
    neteaseAxios
      .post('/api/v6/playlist/detail', {
          id,
          n: 100000,
          s: 8
        }
        ,
        {
          // sameSite: 'none',
          withCredentials: true,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Content-Length,Authorization,Accept,X-Requested-With',
            'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': '__remember_me=true; _ntes_nuid=8608673488fd485c8138bf83113ddea4; NMTID=96092fb0492039d28ceceb5b9bd568bb; MUSIC_A=1f5fa7b6a6a9f81a11886e5186fde7fbc1f4765f83556bdc9daa62187125e4bd4b7f5273fc3921d135b7ea4a1e69cd236a801251dd4c43be3b46178f2a9a74474bd459d627711dc83324751bcc9aaf44c3061cd18d77b7a0; os=ios; appver=8.20.21; SameSite=None'
          }
        })
      .then(({playlist}) => playlist || {})
      .then((playlist) => {
        const {trackIds, tracks} = playlist
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
        getMusicDetail(ids).then(({songs}) => {
          playlist.tracks = formatSongs(songs)
          resolve(playlist)
        })
      })
  })
}*/

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
  return axiosOrigin.get('/music-get/getMusic/SearchMusicResources/20', {
    params: {
      musicName,
      singer: ''
    }
  })
}

// 获取视频音频
export function getAudioUrl(bvid) {
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
