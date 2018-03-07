<template>
    <div id="app">
        <!--主体-->
        <section class="container">
            <header>mmPlayer在线音乐播放器</header>
            <router-view class="router-view"></router-view>
        </section>
    
        <!--更新说明-->
        <!--<mm-dialog :dialogShow="versionShow"></mm-dialog>-->
        
        <!--播放器-->
        <audio ref="mmPlayer" :src="currentMusic.url"></audio>
    </div>
</template>

<script>
    const pkg = require('../package.json');
    import {mapGetters, mapMutations} from 'vuex'
    //import MmDialog from 'base/mm-dialog/mm-dialog'
    //import {getVersion,setVersion} from "assets/js/storage";
    
    export default {
        name: "app",
        //components: {
        //    MmDialog
        //},
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
            setTimeout(function () {
                document.body.removeChild(document.getElementById('appLoading'))
            }, 500)
        },
        computed: {
            /*versionShow(){
                let version = getVersion();
                console.log(version)
                if (version !== null) {
                     console.log('有version');
                    return version !== pkg.version
                } else {
                     console.log('没有version');
                     let newVersion = 1
                    console.log(newVersion)
                    setVersion(3);
                    return true
                }
            },*/
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
