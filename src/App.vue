<template>
    <div id="app">
        <!--主体-->
        <section class="container">
            <header>mmPlayer在线音乐播放器</header>
            <router-view class="router-view"></router-view>
        </section>
        
        <!--更新说明-->
        <mm-dialog ref="versionDialog" :dialogType="1" headText="更新提示" :bodyText="versionBody"></mm-dialog>
        
        <!--播放器-->
        <audio ref="mmPlayer" :src="currentMusic.url"></audio>
    </div>
</template>

<script>
    const pkg = require('../package.json');
    import {mapGetters, mapMutations} from 'vuex'
    import MmDialog from 'base/mm-dialog/mm-dialog'
    import {getVersion, setVersion} from "assets/js/storage";
    
    export default {
        name: "app",
        components: {
            MmDialog
        },
        created() {
            //设置title
            let OriginTitile = document.title, titleTime;
            document.addEventListener('visibilitychange', function() {
                if (document.hidden) {
                    document.title = '死鬼去哪里了！';
                    clearTimeout(titleTime);
                } else {
                    document.title = '(つェ⊂)咦!又好了!';
                    titleTime = setTimeout(function() {
                        document.title = OriginTitile;
                    },2000);
                }
            });
            //设置audio元素
            this.$nextTick(() => {
                this.setAudioele(this.$refs.mmPlayer)
            });
            //首次加载完成移除动画
            if (document.querySelector('#appLoading')) {
                document.querySelector('#appLoading').classList.add("removeAnimate");
            }
            setTimeout(() => {
                document.body.removeChild(document.getElementById('appLoading'));
                let version = getVersion(), newVersion = pkg.version;
                if (version !== null) {
                    setVersion(newVersion);
                    if(version !==newVersion){
                        this.$refs.versionDialog.show()
                    }
                } else {
                    setVersion(newVersion);
                    this.$refs.versionDialog.show()
                }
            }, 500)
        },
        computed: {
            versionBody(){
                return `<div style="text-align: left">
版本号：${pkg.version}<br/>
1、新增播放链接失效后自动重载当前音乐<br>
2、优化删除正在播放列表歌曲失效问题<br>
3、优化删除歌曲过快会触发播放问题<br>
4、优化音乐来源错误不能播放问题<br>
5、优化列表循环不会自动下一曲问题
</div>`
            },
            ...mapGetters([
                'currentMusic'
            ])
        },
        methods: {
            ...mapMutations({
                setAudioele: 'SET_AUDIOELE'
            }),
        }
    }
</script>

<style lang="less">
    @import "assets/css/var";
    
    .container {
        position: relative;
        width: 100%;
        height: 100%;
        color: @text_color;
        font-size: @font_size_medium;
        header {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 50px;
            text-align: center;
            line-height: 50px;
            color: @text_color_active;
            font-size: @font_size_large;
        }
        .router-view {
            width: 100%;
            height: 100%;
        }
    }
</style>
