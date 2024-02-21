import {axiosCommonQQ, axiosQQlistDetail, axiosNetease, axiosNeteaseSpider, axiosBiliSpider, axiosBiliInfo} from '@/utils/axios'
import {DEFAULT_LIMIT} from '@/config'
import {formatSongs as formatNeteaseSongs} from '@/utils/createSongNetease'

// region NeteaseSpider
// 排行榜列表
export function getToplistDetail() {
  return axiosNeteaseSpider.get('/toplist/detail')
}

// 推荐歌单
export function getPersonalized() {
  return axiosNeteaseSpider.get('/personalized')
}

// 歌单详情
export function getPlaylistDetailNeteaseSpider(id) {
  return new Promise((resolve, reject) => {
    axiosNeteaseSpider
      .get('/playlist/detail', {
        params: {id},
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
          playlist.tracks = formatNeteaseSongs(playlist.tracks)
          resolve(playlist)
          return
        }
        // 限制歌单详情最大 500
        const ids = trackIds
          .slice(0, 500)
          .map((v) => v.id)
          .toString()
        getMusicDetail(ids).then(({songs}) => {
          playlist.tracks = formatNeteaseSongs(songs)
          resolve(playlist)
        })
      })
  })
}

// 搜索
export function searchNetease(keywords, page = 0, limit = DEFAULT_LIMIT) {
  return axiosNeteaseSpider.get('/search', {
    params: {
      offset: page * limit,
      limit: limit,
      keywords,
    },
  })
}

// 热搜
export function searchHot() {
  return axiosNeteaseSpider.get('/search/hot')
}

// 获取用户歌单详情
export function getUserPlaylist(uid) {
  return axiosNeteaseSpider.get('/user/playlist', {
    params: {
      uid,
    },
  })
}

// 获取歌曲详情
export function getMusicDetail(ids) {
  return axiosNeteaseSpider.get('/song/detail', {
    params: {
      ids,
    },
  })
}

// 获取音乐是否可以用
export function getCheckMusic(id) {
  return axiosNeteaseSpider.get('/check/music', {
    params: {
      id,
    },
  })
}

// 获取音乐地址 -- 未来可以用
export function getMusicUrl(id) {
  return axiosNeteaseSpider.get('/song/url', {
    params: {
      id,
    },
  })
}

// 获取歌词
export function getLyricSpider(id) {
  const url = '/lyric'
  return axiosNeteaseSpider.get(url, {
    params: {
      id,
    },
  })
}

// 获取音乐评论
export function getComment(id, page, limit = DEFAULT_LIMIT) {
  return axiosNeteaseSpider.get('/comment/music', {
    params: {
      offset: page * limit,
      limit: limit,
      id,
    },
  })
}

// endregion

// region BiliSpider
// 搜索b站视频
export function searchVideoResources(musicName, singer) {
  return axiosBiliSpider.get('/music-get/getMusic/SearchMusicResources/20', {
    params: {
      musicName,
      singer: ''
    }
  })
}

// 获取视频音频
export function getAudioUrl(bvid) {
  return axiosBiliSpider.get(`/music-get/getMusic/getMusicUrl/${bvid}`, {
    params: {
      musicName: 'bvid',
      singer: '',
      tried: false
    },
  })
}

// endregion

// region Bilibili
export function searchBili(keywords, page = 1) {
  let url = `/web-interface/wbi/search/type?category_id=&search_type=video&duration=1&keyword=${keywords}&page=${page}`
  return axiosBiliInfo.get(url)
}

// 获取视频cid
export function getAudioCidFromBili(bvid) {
  // //console.log('getAudioCidFromBili')
  return axiosBiliInfo.get(`/web-interface/view?bvid=${bvid}`)
}

// 获取视频音频
export function getAudioUrlFromBili(bvid, cid) {
  //console.log('getAudioUrlFromBili')
  return axiosBiliInfo.get(`https://api.bilibili.com/x/player/wbi/playurl?bvid=${bvid}&fnval=4048&cid=${cid}`)
}

// endregion

// region Netease
export function getLyric(id) {
  const data = `id=${id}&tv=-1&lv=-1&rv=-1&kv=-1`
  return axiosNeteaseSpider.post('https://music.163.com/api/song/lyric?_nmclfl=1', data)
}

export function getPlaylistDetailNetease(id) {
  return new Promise((resolve, reject) => {
    axiosNetease.post('/api/v6/playlist/detail', `id=${id}&n=100000&s=8`)
      .then(({playlist}) => {
        ////console.log("playlist=", playlist)
        const {trackIds, tracks} = playlist
        if (!playlist || !Array.isArray(trackIds)) {
          reject(new Error('获取歌单详情失败'))
          return
        }
        // 过滤完整歌单 如排行榜
        if (tracks.length === trackIds.length) {
          playlist.tracks = formatNeteaseSongs(playlist.tracks)
          resolve(playlist)
          return
        }
        // 限制歌单详情最大 500
        const ids = trackIds
          .slice(0, 500)
          .map((v) => v.id)
          .toString()
        getMusicDetail(ids).then(({songs}) => {
          playlist.tracks = formatNeteaseSongs(songs)
          resolve(playlist)
        })
      })
  })
}

//endregion

// region QQ

// 抓包时看到该请求默认page_num是1,page_num=0时获取的和num=1相同. num_per_page没有限制,可以任意设置
export function searchQQ(keywords, page = 0, limit = DEFAULT_LIMIT) {
  const searchBodyHead = `{"comm":{"g_tk":1579906136,"uin":1431243,"format":"json","inCharset":"utf-8","outCharset":"utf-8","notice":0,"platform":"h5","needNewCode":1,"ct":23,"cv":0},`
  const searchBodyTail = '}'
  const curReq = `"req_0":{"method":"DoSearchForQQMusicDesktop","module":"music.search.SearchCgiService","param":{"remoteplace":"txt.mqq.all","searchid":"55215592813312667","search_type":0,"query":"${keywords}","page_num":${page},"num_per_page":${limit}}}`
  const body = searchBodyHead + curReq + searchBodyTail
  return axiosCommonQQ.post('', body)
}

export function getQQMusicListDetail(id,offset=0, limit = 30) {
  const searchBodyHead = `{"comm":{"g_tk":1106131342,"uin":14324289,"format":"json","platform":"h5"},`
  const searchBodyTail = '}'
  // const curReq = `"req_0":{"module":"music.srfDissInfo.aiDissInfo","method":"uniform_get_Dissinfo","param":{"disstid":983331199,"enc_host_uin":"","tag":1,"userinfo":1,"song_begin":0,"song_num":30}}`
  const curReq = `"req_0":{"module":"music.srfDissInfo.aiDissInfo","method":"uniform_get_Dissinfo","param":{"disstid":${id},"enc_host_uin":"","tag":1,"userinfo":1,"song_begin":${offset},"song_num":${limit}}}`
  const body = searchBodyHead + curReq + searchBodyTail
  return axiosQQlistDetail.post('', body)
}

const qqMusicsApiBodyHead = `{"comm":{"cv":4747474,"ct":24,"format":"json","inCharset":"utf-8","outCharset":"utf-8","notice":0,"platform":"yqq.json","needNewCode":1,"uin":1431243,"g_tk_new_20200303":899819903,"g_tk":899819903},`
const qqMusicsApiBodyTail = `}`

export function getQQMusicVipOneMinuteUrl(vipMids, vipMediaMids) {
  // //console.log('getQQMusicVipOneMinuteUrl')
  const curReq = `"req_0":{"module":"vkey.GetVkeyServer","method":"CgiGetVkey","param":{"guid":"9920044491","songmid":[${vipMids}],"songtype":[0],"uin":"1431243","loginflag":1,"platform":"20","filename":[${vipMediaMids}]}}`
  const body = qqMusicsApiBodyHead + curReq + qqMusicsApiBodyTail
  return axiosCommonQQ.post('', body)
}

export function getQQMusicUrl(mids) {
  //console.log('getQQMusicUrl')
  const curReq = `"req_0":{"module":"vkey.GetVkeyServer","method":"CgiGetVkey","param":{"guid":"3565059752","songmid":[${mids}],"songtype":[0,0,0,0,0,0],"uin":"1431243","loginflag":1,"platform":"20","ctx":1}}`
  const body = qqMusicsApiBodyHead + curReq + qqMusicsApiBodyTail
  return axiosCommonQQ.post('', body)
}

export function getQQLyric(mid) {
  const curReq = ` "req_0": {"module": "music.musichallSong.PlayLyricInfo","method": "GetPlayLyricInfo","param": {"songMID": "${mid}"}}`
  const body = qqMusicsApiBodyHead + curReq + qqMusicsApiBodyTail
  return axiosCommonQQ.post('', body)
}

// endregion
