import {getAudioCidFromBili, getAudioUrlFromBili} from "@/api";
import {Song} from "@/utils/song";

// 封装b站音频对象
export function createBiliSong(videoInfo) {
  const durationFormat = videoInfo.duration.split(':') //视频duration最小单位是秒, 匹配歌词的话可能有误差
  const minute = parseInt(durationFormat[0])
  const second = parseInt(durationFormat[1])
  const duration = (minute * 60 + second)

  const biliSource = {
    bvid: videoInfo.bvid,
    urls: [],
    platform: 'bili',
  }

  const biliSong = new Song({
    platform: 'bili',
    id: videoInfo.bvid,
    name: videoInfo.title,
    image: `https:${videoInfo.pic}@672w_378h_1c_!web-search-common-cover.avif`,
    duration,
    singer: videoInfo.bvid,
    album: 'bilibili 干杯!',
    audioSource: biliSource,
    lyricSource: videoInfo.lyricSource || null
  })

  return getAudioCidFromBili(videoInfo.bvid).then((data) => {
    // //console.log("getAudioCidFromBili data=", data)
    biliSource.cid = data.data.cid
    return biliSong
  })

  /*return getAudioUrlFromBili(videoInfo.bvid, biliSource.cid).then(data => {
    //console.log("biliSong=", biliSong)
    const audios = data.data.dash.audio
    const urls = []
    for (let i = 0; i < audios.length; i++) {
      const quality = (Math.round(audios[i].bandwidth / 1000)) + 'kbps'
      const url = audios[i].baseUrl
      const urlObj = {quality, url}
      urls.push(urlObj)
    }
    biliSong.audioSource.urls = urls

  })*/
}
