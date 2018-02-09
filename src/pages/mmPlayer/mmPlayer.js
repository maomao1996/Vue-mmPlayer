const mmPlayerMusic = {
    initAudio(that){
        const ele = that.audioEle;
        //获取当前播放时间
        ele.ontimeupdate = () => {
            that.currentTime = ele.currentTime
        };
        //获取当前音乐的总时间
        ele.oncanplay = () => {
            that.duration = ele.duration
        };
        //当前音乐播放完毕
        ele.onended = () => {
            that.next()
        };
        ele.onplay = () => {
            let timer;
            clearTimeout(timer);
            timer = setTimeout(() => {
                that.musicReady = true
            },100);
            that.setHistoryList(that.currentMusic)
        };
        ele.onerror = () => {
            that.musicReady = true
        };
    }
};

export default mmPlayerMusic
