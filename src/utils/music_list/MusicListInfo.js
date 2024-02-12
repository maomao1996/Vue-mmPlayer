export class MusicListInfo {
  constructor({platform, id, title, desc, creator, image, listCount, tags=[]}) {
    this.platform = platform
    this.id = id
    this.title = title
    this.desc = desc
    this.creator = creator
    this.listCount = listCount
    this.image = image
    this.tags = tags //元素是对象{id,name}
  }
}
