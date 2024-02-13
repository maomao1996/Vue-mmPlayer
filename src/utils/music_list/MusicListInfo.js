export class MusicListInfo {
  constructor({platform, id, title, desc, creator, image, listenCount, tags=[]}) {
    this.platform = platform
    this.id = id
    this.title = title
    this.desc = desc
    this.creator = creator
    this.listCount = listenCount
    this.image = image
    this.tags = tags //元素是对象{id,name}
  }
}

export function createCustomMusicListInfo(id, title, desc, image, tags) {
  return new MusicListInfo({
    platform: 'custom',
    creator: 'Myself',
    listenCount: 0,
    id,
    title,
    desc,
    image,
    tags,
  })
}
