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
            //设置audio元素
            this.$nextTick(() => {
                this.setAudioele(this.$refs.mmPlayer)
            });
            //首次加载完成移除动画
            if (!document.querySelector('#appLoading')) {
                return
            }
            document.querySelector('#appLoading').classList.add("removeAnimate");
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
1、新增双击播放<br>
2、新增更新提示<br>
3、优化无歌词时的显示<br>
4、优化暂无内容提醒<br>
5、优化列表多位歌手的显示
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
