<template>
    <div id="app">
        <!--主体-->
        <mm-header></mm-header>
        <router-view class="router-view"></router-view>
        
        <!--更新说明-->
        <mm-dialog ref="versionDialog" :dialogType="1" headText="更新提示" :bodyText="versionBody"></mm-dialog>
        
        <!--播放器-->
        <audio ref="mmPlayer"></audio>
    </div>
</template>

<script>
    const pkg = require('../package.json');
    import {mapMutations} from 'vuex'
    import MmHeader from 'components/mm-header/mm-header'
    import MmDialog from 'base/mm-dialog/mm-dialog'
    import {getVersion, setVersion} from "assets/js/storage";
    
    export default {
        name: "app",
        components: {
            MmHeader, MmDialog
        },
        created() {
            //设置title
            let OriginTitile = document.title, titleTime;
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) {
                    document.title = '死鬼去哪里了！';
                    clearTimeout(titleTime);
                } else {
                    document.title = '(つェ⊂)咦!又好了!';
                    titleTime = setTimeout(function () {
                        document.title = OriginTitile;
                    }, 2000);
                }
            });
            //设置audio元素
            this.$nextTick(() => {
                this.setAudioele(this.$refs.mmPlayer)
            });
            //首次加载完成移除动画
            if (document.querySelector('#appLoading')) {
                document.querySelector('#appLoading').classList.add("removeAnimate");
                setTimeout(() => {
                    document.body.removeChild(document.getElementById('appLoading'));
                    let version = getVersion(), newVersion = pkg.version;
                    if (version !== null) {
                        setVersion(newVersion);
                        if (version !== newVersion) {
                            this.$refs.versionDialog.show()
                        }
                    } else {
                        setVersion(newVersion);
                        this.$refs.versionDialog.show()
                    }
                }, 500)
            }
        },
        computed: {
            versionBody() {
                return `<div class="mm-dialog-text text-left">
版本号：${pkg.version}<br/>
1、 新增同步网易云歌单功能<br>
2、 新增快捷键控制<br>
&nbsp;&nbsp;- 上一曲 Ctrl + Left<br>
&nbsp;&nbsp;- 播放暂停 Ctrl + Space<br>
&nbsp;&nbsp;- 下一曲 Ctrl + Right<br>
&nbsp;&nbsp;- 切换播放模式 Ctrl + O<br>
&nbsp;&nbsp;- 音量加 Ctrl + Up<br>
&nbsp;&nbsp;- 音量减 Ctrl + Down<br>
3、 修复safari和安卓UC不能播放的问题<br>
4、 优化url失效问题和音乐无法播放的提示<br>
5、 优化移动端样式兼容
</div>`
            }
        },
        methods: {
            ...mapMutations({
                setAudioele: 'SET_AUDIOELE'
            }),
        }
    }
</script>

<style lang="less">
    @import "~assets/css/var";
    
    #app {
        position: relative;
        width: 100%;
        height: 100%;
        color: @text_color;
        font-size: @font_size_medium;
        .router-view {
            width: 100%;
            height: 100%;
        }
        audio{
            position: fixed;
        }
    }
</style>
