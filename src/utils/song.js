import { toHttps } from './util'
import { getSid } from './storage'
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
export function computeMusicUrl(music) {
  return `${process.env.VUE_APP_BASE_API_URL}webapi/AudioStation/stream.cgi/0.${
    music.additional['song_audio']['codec']
  }?method=stream&_sid=${getSid()}&api=SYNO.AudioStation.Stream&id=${
    music.id
  }&version=2`
}

export class Song {
  constructor({ id, name, singer, album, image, duration, url }) {
    this.id = id
    this.name = name
    this.singer = singer
    this.album = album
    this.image = image
    this.duration = duration
    this.url = url
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
    duration: duration / 1000,
    url: `https://music.163.com/song/media/outer/url?id=${music.id}.mp3`
  })
}

// 歌曲数据格式化
export function formatSongs(list) {
  const Songs = []
  list.forEach((item) => {
    const musicData = item
    if (musicData.id) {
      Songs.push(createSong(musicData))
    }
  })
  return Songs
}
