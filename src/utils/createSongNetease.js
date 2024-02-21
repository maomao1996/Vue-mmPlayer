import {toHttps} from './util'
import {Song} from "@/utils/song";
import {getMusicDetail} from "@/api";
import {getBindInfo} from "@/utils/storage";

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

export function createSong(music) {
  const album = music.album || music.al || {}
  const duration = music.duration || music.dt
  const subTitles = music.alia || music.alias || []
  const fee = music.fee || 0  // 0和8为免费听

  return new Song({
    platform: 'netease',
    limit: fee,
    id: music.id,
    name: music.name,
    subTitle: subTitles.length === 0 ? '' : subTitles[0],
    singer: filterSinger(music.ar || music.artists),
    album: album.name,
    image: (toHttps(album.picUrl) || null) + '?param=300y300',
    // 原本是ms单位, 封装成music对象后duration就以秒为单位了, 但是带有3位小数
    originDuration: duration / 1000,
    duration: (fee === 0 || fee === 8) ? duration / 1000 : 30,
    url: `https://music.163.com/song/media/outer/url?id=${music.id}.mp3`, //网易url
    lyricSource: {platform: 'netease', songId: music.id}
  })
}

// 歌曲数据格式化
export function formatSongs(list) {
  ////console.log('listLength=', list.length)
  const Songs = []
  list.forEach((item) => {
    const musicData = item
    if (musicData.id) {
      const song = createSong(musicData)
      Songs.push(song)
    }
  })
  ////console.log("netease songs=", Songs)
  return Songs
}
