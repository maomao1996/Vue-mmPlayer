import {playMode} from "assets/js/config";

const mmPlayerMusic = {
    initAudio(that) {
        const ele = that.audioEle;
        //开始播放音乐
        ele.onplay = () => {
            //console.log('onplaying！')
            //console.log('onplay！', e)
            let timer;
            clearTimeout(timer);
            timer = setTimeout(() => {
                that.musicReady = true
            }, 100);
        };
        ele.onplaying = () => {
        
        };
        //获取当前播放时间
        ele.ontimeupdate = () => {
            that.currentTime = ele.currentTime
        };
        //暂停音乐播放
        //ele.onpause = () => {
        //    that.setPlaying(false)
        //};
        //当前音乐播放完毕
        ele.onended = () => {
            if (that.mode === playMode.loop) {
                that.loop()
            } else {
                that.next()
            }
        };
        //音乐播放出错
        ele.onerror = () => {
            that.$mmToast('当前音乐不可播放，已自动播放下一曲');
            that.next();
            //console.log('播放出错啦！')
        };
        //音乐进度拖动大于加载时重载音乐
        ele.onstalled = () => {
            ele.load();
            that.setPlaying(false);
            let timer;
            clearTimeout(timer);
            timer = setTimeout(() => {
                that.setPlaying(true);
            }, 10);
            //console.log('onstalled ！');
        };
        //将能播放的音乐加入播放历史
        ele.oncanplay = () => {
            if (that.historyList.length===0||that.currentMusic.id !== that.historyList[0].id) {
                that.setHistory(that.currentMusic)
            }
        }
    }
};

export default mmPlayerMusic
