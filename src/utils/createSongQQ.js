import {Song} from './song'
import {getQQMusicVipOneMinuteUrl, getQQMusicUrl} from "@/api";

function filterSinger(singers = []) {
  if (!Array.isArray(singers) || !singers.length) {
    return ''
  }
  let singersFormatStr = []
  singers.forEach((item) => {
    singersFormatStr.push(item.name)
  })
  return singersFormatStr.join('/')
}

export function createSong(music) {
  const album = music.album
  let image = ''
  if (album.pmid) {
    image = `http://y.gtimg.cn/music/photo_new/T002R300x300M000${album.pmid}.jpg`
  } else if (music.singer[0].mid) {
    image = `http://y.gtimg.cn/music/photo_new/T001R500x500M000${music.singer[0].mid}.jpg`
  }
  const fee = parseInt(music.pay.pay_play) !== 0 ? 1 : 0 // 0是免费听.  目前猜测这个字段是标识歌曲是否是vip歌曲
  // console.log(music.title + ' = ', music.pay.pay_play) // 如果这个字段判断错误, 则放开这个log进行检查
  return new Song({
    platform: 'qq',
    id: music.mid,
    limit: fee, //默认是非会员, 之后获取url时会检测到底是不是非会员歌曲
    name: music.title,
    subTitle: music.subtitle,
    singer: filterSinger(music.singer),
    album: album.name,
    image: image,
    // QQ接口单位为s
    duration: music.interval,
    originDuration: music.interval,
    url: `http://dl.stream.qqmusic.qq.com/`,
    lyricSource: {platform: 'qq', songId: music.mid},
  })
}

// 歌曲列表数据格式化
export function formatSongs(songs) {
  console.log("formatQQsongs")
  const formattedSongs = []
  const len = songs.length
  let mids = ''

  let vipMidsStr = ''
  let vipMediaMidsStr = ''

  // 创建music对象并统计歌曲mid
  songs.forEach((item) => {
    mids += ('\"' + item.mid + '\"' + ',')
    if (item.id) {
      formattedSongs.push(createSong(item))
    }
  })
  mids = mids.replace(/,\s*$/, '');

  //获取歌曲url
  return getQQMusicUrl(mids).then((data) => {
    // console.log("getQQMusicUrl==>")
    // console.log(data.req_0.data.midurlinfo)
    const songsUrlInfo = data.req_0.data.midurlinfo
    const vipSongs = []
    for (let i = 0; i < len; i++) {
      if (songsUrlInfo[i].purl === '') {
        if (formattedSongs[i].limit !== 1) {
          // 上面猜测了一个字段是标识vip歌曲. 如果那个字段判断错误, 则这里会输出错误log
          console.log("================================ qq vip music check error !!!!!!!!!")
          console.log('错误歌名: ' + formattedSongs[i].name + ' -- 序号: ' + ((i + 1) * 2) + '歌曲origin数据: ')
          console.log(songs[i])
          formattedSongs[i].singer += ' vip check error'
        }
        // 会员歌曲
        formattedSongs[i].limit = 1
        vipMidsStr += ('\"' + songs[i].mid + '\"' + ',')
        vipMediaMidsStr += ('\"RS02' + songs[i].file.media_mid + '.mp3\"' + ',')
        //@TODO 待优化: 这个标记可以用一个int, 32位正好可以标记30首song
        vipSongs.push(i)
      } else {
        formattedSongs[i].url += songsUrlInfo[i].purl
      }

    }
    // console.log("assigned songs' url")
    // console.log(formattedSongs)
    vipMidsStr = vipMidsStr.replace(/,\s*$/, '');
    vipMediaMidsStr = vipMediaMidsStr.replace(/,\s*$/, '');

    // console.log('vipSongs')
    // console.log(vipSongs)
    // console.log(vipMidsStr)
    // console.log(vipMediaMidsStr)
    return vipSongs
  }).then(vipSongs => {
    // console.log("vipSongs=", vipSongs)
    const vipLen = vipSongs.length
    if (vipLen !== 0) {
      return getQQMusicVipOneMinuteUrl(vipMidsStr, vipMediaMidsStr).then(data => {
        // console.log('getVIp')
        // console.log(vipSongs)
        const vipUrls = data.req_0.data.midurlinfo
        for (let i = 0; i < vipLen; i++) {
          // console.log("add vipUrl")
          // console.log(vipUrls[i].purl)
          formattedSongs[vipSongs[i]].url += vipUrls[i].purl
          formattedSongs[vipSongs[i]].duration = 60 //试听60s
        }
        return formattedSongs
      })
    } else {
      return formattedSongs
    }
  })
}
