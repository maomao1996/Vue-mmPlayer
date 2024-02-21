import {createBiliSong, createBiliSongFromBind} from "@/utils/createBiliSong";

export function createComplexSong(videoInfo) {
  ////console.log('143243312413', videoInfo.complex.mixInfo)
  return createBiliSong(videoInfo).then(song => {
    song.id = videoInfo.complex.id
    song.name = videoInfo.complex.name
    // song.originDuration = videoInfo.complex.duration
    song.originDuration = videoInfo.complex.originDuration
    song.subTitle = videoInfo.complex.subTitle
    song.platform = 'complex'
    song.limit = 0
    song.image = videoInfo.complex.image
    song.singer = videoInfo.complex.singer
    song.album = videoInfo.complex.album
    song.mixInfo = videoInfo.complex.mixInfo
    return song
  })
}
