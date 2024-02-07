import { toHttps } from './util'

function filterSinger(singers) {
  if (!Array.isArray(singers) || !singers.length) {
    return ''
  }
  let arr = []
  singers.forEach((item) => {
    arr.push(item.name)
  })
  return arr.join('/')
}

export class Song {
  constructor({ id, name, singer, album, image, duration, url, urls, canUrls }) {
    this.id = id
    this.name = name
    this.singer = singer
    this.album = album
    this.image = image
    this.duration = duration
    this.url = url
    this.urls = urls //收集的url
    this.canUrls = canUrls //可以播放的url
  }
}

export function createSong(music) {
  const album = music.album || music.al || {}
  const duration = music.duration || music.dt
  return new Song({
    id: music.id,
    name: music.name,
    singer: filterSinger(music.ar || music.artists),
    album: album.name,
    image: toHttps(album.picUrl) || null,
    // 原本是ms单位, 封装成music对象后duration就以秒为单位了, 但是带有3位小数
    duration: duration / 1000,
    url: `https://music.163.com/song/media/outer/url?id=${music.id}.mp3`, //网易url
    urls: [],
    canUrls: []
  })
}

// 歌曲数据格式化
export function formatSongs(list) {
  const Songs = []
  list.forEach((item) => {
    const musicData = item
    if (musicData.id) {
      const song = createSong(musicData)
      song.urls.push(song.url)
      Songs.push(song)
    }
  })
  return Songs
}
