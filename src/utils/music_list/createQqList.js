import {getQQMusicListDetail} from "@/api";
import {MusicListInfo} from "@/utils/music_list/MusicListInfo";

export function createQqList(id) {
  return getQQMusicListDetail(id).then(data=> {
    ////console.log(data)
    const dirinfo = data.req_0.data.dirinfo
    return new MusicListInfo({
      platform: 'qq',
      id: dirinfo.id,
      title: dirinfo.title,
      desc: dirinfo.desc,
      creator: dirinfo.host_nick,
      image: dirinfo.picurl,
      listenCount: dirinfo.listennum,
      tags: dirinfo.tags,
      })
  })
}
