import {getQQMusicListDetail} from "@/api";

export function createQqList(id) {
  getQQMusicListDetail(id).then(data=> {
    console.log(data)
  })
}
