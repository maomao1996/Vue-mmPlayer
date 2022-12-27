function migu(packages) {
  const { axios } = packages

  const searchRows = 20
  const baseUrl = 'http://nas.uyoqu.com:5000'
  const username = 'yoqu'
  const password = 'JWC1314ame.,'
  async function searchBase(query, page, type) {
    const headers = {
      Accept: 'application/json, text/javascript, */*; q=0.01',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      Connection: 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Host: 'm.music.migu.cn',
      Referer: `https://m.music.migu.cn/v3/search?keyword=${encodeURIComponent(
        query
      )}`,
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Mobile Safari/537.36 Edg/89.0.774.68',
      'X-Requested-With': 'XMLHttpRequest'
    }
    const params = {
      keyword: query,
      type,
      pgc: page,
      rows: searchRows
    }
    const data = await axios.get(
      'https://m.music.migu.cn/migu/remoting/scr_search_tag',
      { headers, params }
    )
    return data.data
  }

  function musicCanPlayFilter(_) {
    return _.mp3 || _.listenUrl || _.lisQq || _.lisCr
  }

  async function searchMusic(query, page) {
    const data = await searchBase(query, page, 2)
    const musics = data.musics.filter(musicCanPlayFilter).map((_) => ({
      id: _.id,
      artwork: _.cover,
      title: _.songName,
      artist: _.artist,
      album: _.albumName,
      url: musicCanPlayFilter(_),
      copyrightId: _.copyrightId,
      singerId: _.singerId
    }))
    return {
      isEnd: +data.pageNo * searchRows >= data.pgt,
      data: musics
    }
  }

  async function searchAlbum(query, page) {
    const data = await searchBase(query, page, 4)
    const albums = data.albums.map((_) => ({
      id: _.id,
      artwork: _.albumPicM,
      title: _.title,
      date: _.publishDate,
      artist: (_.singer || []).map((s) => s.name).join(','),
      singer: _.singer,
      fullSongTotal: _.fullSongTotal
    }))
    return {
      isEnd: +data.pageNo * searchRows >= data.pgt,
      data: albums
    }
  }

  async function searchArtist(query, page) {
    const data = await searchBase(query, page, 1)
    const artists = data.artists.map((result) => ({
      name: result.title,
      id: result.id,
      avatar: result.artistPicM,
      worksNum: result.songNum
    }))
    return {
      isEnd: +data.pageNo * searchRows >= data.pgt,
      data: artists
    }
  }

  async function getLyric(musicItem) {
    const url = `/webapi/AudioStation/lyrics.cgi?id=${musicItem.id}&method=getlyrics&library=shared&api=SYNO.AudioStation.Lyrics&version=2`
    const result = await axios.get(url)
    return {
      rawLrc: result.data.lyrics
    }
  }

  async function importMusicSheet(urlLike) {
    console.log('importMusicSheet', urlLike)
    const loginResult = await authLogin()
    console.log('loginResult', loginResult)
    const url = `/webapi/AudioStation/song.cgi?limit=100&method=list&library=shared&api=SYNO.AudioStation.Song&additional=song_tag,song_audio,song_rating&sort_by=random&version=3`
    const data = await axios.get(url)
    const songs = data.data.songs
    return songs.items.map((_) => ({
      id: _.id,
      artwork: computeCoverUrl(_.id),
      title: _.title,
      artist: _.additional.song_tag.artist,
      album: _.additional.song_tag.album,
      singerId: _.additional.song_tag.artist
    }))
  }
  async function authLogin() {
    var config = {
      method: 'get',
      url: `${baseUrl}/webapi/entry.cgi?api=SYNO.API.Auth&version=7&method=login&account=${username}&passwd=${password}`
    }
    const data = await axios(config)
    if (!data.success) {
      throw new Error('登录失败')
    }
  }
  function computeCoverUrl(musicId) {
    const cover = `${baseUrl}/webapi/AudioStation/cover.cgi?method=getsongcover&api=SYNO.AudioStation.Cover&id=${musicId}&version=3`
    return cover
  }
  function computeSourceUrl(musicId) {
    const musicUrl = `${baseUrl}/webapi/AudioStation/stream.cgi?method=stream&api=SYNO.AudioStation.Stream&id=${musicId}&version=2`
    return musicUrl
  }
  return {
    platform: '群晖音乐',
    version: '0.0.1',
    appVersion: '>0.0.1-alpha.10',
    primaryKey: ['id'],
    cacheControl: 'no-store',
    srcUrl: 'https://gitee.com/maotoumao/MusicFreePlugins/raw/master/qunhui.js',
    async getMediaSource(musicItem, quality) {
      // 音质切换暂时不处理
      return {
        artwork: computeCoverUrl(musicItem.id),
        url: computeSourceUrl(musicItem.id)
      }
    },
    async search(query, page, type) {
      //   if (type === 'music') {
      //     return await searchMusic(query, page)
      //   }
      //   if (type === 'album') {
      //     return await searchAlbum(query, page)
      //   }
      //   if (type === 'artist') {
      //     return await searchArtist(query, page)
      //   }
      //todo 搜索
    },

    async getAlbumInfo(albumItem) {
      const headers = {
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        Connection: 'keep-alive',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Host: 'm.music.migu.cn',
        Referer: `https://m.music.migu.cn/migu/l/?record=record&id=${albumItem.id}`,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 6.0.1; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Mobile Safari/537.36 Edg/89.0.774.68',
        'X-Requested-With': 'XMLHttpRequest'
      }
      const musicList =
        (
          await axios.get(
            'https://m.music.migu.cn/migu/remoting/cms_album_song_list_tag',
            {
              headers,
              params: {
                albumId: albumItem.id,
                pageSize: 30
              }
            }
          )
        ).data || {}
      const albumDesc =
        (
          await axios.get(
            'https://m.music.migu.cn/migu/remoting/cms_album_detail_tag',
            {
              headers,
              params: {
                albumId: albumItem.id
              }
            }
          )
        ).data || {} // 有个trackcount

      return {
        ...albumItem,
        description: albumDesc.albumIntro,
        musicList: musicList.result.results
          .filter(musicCanPlayFilter)
          .map((_) => ({
            id: _.songId,
            artwork: _.picM,
            title: _.songName,
            artist: (_.singerName || []).join(', '),
            album: albumItem.title,
            url: musicCanPlayFilter(_),
            rawLrc: _.lyricLrc,
            copyrightId: _.copyrightId,
            singerId: _.singerId
          }))
      }
    },
    getArtistWorks: getArtistWorks,
    getLyric: getLyric,
    importMusicSheet
  }
}

import axios from 'axios'

migu({ axios })
  .importMusicSheet('abc')
  .then((res) => console.log(res))
