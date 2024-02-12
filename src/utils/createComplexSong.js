import {createBiliSong} from "@/utils/createBiliSong";

export function createComplexSong(videoInfo) {
  console.log('143243312413', videoInfo.mixInfo)
  return createBiliSong(videoInfo).then(song => {
    song.id = videoInfo.complex.id
    song.name = videoInfo.complex.name
    song.subTitle = videoInfo.complex.subTitle
    song.platform = 'complex'
    song.image = videoInfo.complex.image
    song.singer = videoInfo.complex.singer
    song.album = videoInfo.complex.album
    song.mixInfo = videoInfo.complex.mixInfo
    return song
  })
}
