<template>
    <div id="app">
        <!--加载动画-->
        <mm-loading v-model="isShow"></mm-loading>
        
        <section class="container">
            <header>mmPlayer在线音乐播放器</header>
            <router-view class="router-view"></router-view>
        </section>
        
        <!--播放器-->
        <audio ref="mmPlayer" :src="`https://music.163.com/song/media/outer/url?id=${currentMusic.id}.mp3`"></audio>
    </div>
</template>

<script>
    import {mapGetters, mapMutations} from 'vuex'
    import MmLoading from 'base/mm-loading/mm-loading'
    
    export default {
        name: "app",
        components: {
            MmLoading
        },
        created() {
            console.info('欢迎使用 MmPlayer!\n作者：茂茂(http://www.mtnhao.com)\nGithub：https://github.com/maomao1996/mmPlayer\n歌曲来源于网易云音乐(http://music.163.com)');
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
            ...mapGetters([
                'isShow',
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
