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

export function createPlayList(music) {
  return new Song({
    id: music.id,
    name: music.name,
    singer: filterSinger(music.ar || music.artists),
    album: music.album.name,
    image: toHttps(music.album.picUrl) || null,
    duration: music.duration / 1000,
    url: `https://music.163.com/song/media/outer/url?id=${music.id}.mp3`
  })
}

export function createTopList(music) {
  return new Song({
    id: music.id,
    name: music.name,
    singer: filterSinger(music.ar || music.artists),
    album: music.al.name,
    image: toHttps(music.al.picUrl),
    duration: music.dt / 1000,
    url: `https://music.163.com/song/media/outer/url?id=${music.id}.mp3`
  })
}

// 歌曲数据格式化
const formatSongs = function formatPlayList(list) {
  let Songs = []
  list.forEach((item) => {
    const musicData = item
    if (musicData.id) {
      Songs.push(createPlayList(musicData))
    }
  })
  return Songs
}

export const formatTopSongs = function formatTopList(list) {
  let Songs = []
  list.forEach((item) => {
    const musicData = item
    if (musicData.id) {
      Songs.push(createTopList(musicData))
    }
  })
  return Songs
}

export default formatSongs
