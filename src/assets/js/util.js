//随机排序数组 https://github.com/jashkenas/underscore/blob/master/underscore.js
function random(min, max) {
    if (max == null) {
        max = min;
        min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
}

export const randomSortArray = function (arr) {
    let length = arr.length,
        shuffled = Array(length);
    for (let index = 0, rand; index < length; index++) {
        rand = random(0, index);
        if (rand !== index) shuffled[index] = shuffled[rand];
        shuffled[rand] = arr[index];
    }
    return shuffled;
    
};

export function debounce(func, delay) {
    let timer;
    return function (...args) {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }
}

//补0函数
export function addZero(s) {
    return s < 10 ? '0' + s : s
}

//歌词解析
export function parseLyric(lrc) {
    let lyrics = lrc.split("\n");
    let lrcObj = [];
    for (let i = 0; i < lyrics.length; i++) {
        let lyric = decodeURIComponent(lyrics[i]);
        let timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
        let timeRegExpArr = lyric.match(timeReg);
        if (!timeRegExpArr) continue;
        let clause = lyric.replace(timeReg, '');
        for (let k = 0, h = timeRegExpArr.length; k < h; k++) {
            let t = timeRegExpArr[k];
            let min = Number(String(t.match(/\[\d*/i)).slice(1)),
                sec = Number(String(t.match(/\:\d*/i)).slice(1));
            let time = min * 60 + sec;
            if (clause !== '') {
                lrcObj.push({time: time, text: clause})
            }
        }
    }
    return lrcObj;
}
