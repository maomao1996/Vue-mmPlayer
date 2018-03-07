import {playMode} from "assets/js/config";

const mmPlayerMusic = {
    initAudio(that) {
        const ele = that.audioEle;
        //获取当前播放时间
        ele.ontimeupdate = () => {
            that.currentTime = ele.currentTime
        };
        //当前音乐播放完毕
        ele.onended = () => {
            if (that.mode === playMode.loop) {
                that.loop()
            }else{
                that.next()
            }
        };
        ele.onplay = () => {
            let timer;
            clearTimeout(timer);
            timer = setTimeout(() => {
                that.musicReady = true
            }, 100);
            that.setHistory(that.currentMusic)
        };
        ele.onerror = () => {
            that.musicReady = true
        };
    }
};

export default mmPlayerMusic
