function filterSinger(singers) {
    let arr = [];
    singers.forEach(item => {
        arr.push(item.name)
    });
    return arr.join('/')
}

export default class Song {
    constructor({id, name, singer, album, image,duration, url}) {
        this.id = id;
        this.name = name;
        this.singer = singer;
        this.album = album;
        this.image = image;
        this.duration = duration;
        this.url = url
    }
}

export function createSerach(music) {
    return new Song({
        id: music.id,
        name: music.name,
        singer: music.artists.length>0 && filterSinger(music.artists),
        album: music.album.name,
        image: null,
        duration: music.duration/1000,
        url: `https://music.163.com/song/media/outer/url?id=${music.id}.mp3`
    })
}

export function createTopList(music) {
    return new Song({
        id: music.id,
        name: music.name,
        singer: music.ar.length>0 && filterSinger(music.ar),
        album: music.al.name,
        image: music.al.picUrl,
        duration: music.dt/1000,
        url: `https://music.163.com/song/media/outer/url?id=${music.id}.mp3`
    })
}
