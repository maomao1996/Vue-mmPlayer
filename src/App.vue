<template>
    <div id="app">
        <!--主体-->
        <mm-header/>
        <router-view class="router-view" />

        <!--更新说明-->
        <mm-dialog ref="versionDialog"
                   type="alert"
                   headText="更新提示"
                   :bodyText="versionBody" />

        <!--播放器-->
        <audio ref="mmPlayer"></audio>
    </div>
</template>

<script>
    import {mapMutations,mapActions} from 'vuex'
    import {topList} from 'api'
    import {defaultSheetId, VERSION} from '@/config'
    import {createTopList} from 'assets/js/song'
    import MmHeader from 'components/mm-header/mm-header'
    import MmDialog from 'base/mm-dialog/mm-dialog'
    import {getVersion, setVersion} from "assets/js/storage";
    
    export default {
        name: "app",
        components: {
            MmHeader, MmDialog
        },
        created() {
            //获取正在播放列表
            topList(defaultSheetId)
            .then((res) => {
                if (res.status === 200) {
                    let list = this._formatSongs(res.data.playlist.tracks.slice(0,100));
                    this.setPlaylist({list})
                }
            })

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
                    let version = getVersion();
                    if (version !== null) {
                        setVersion(VERSION);
                        if (version !== VERSION) {
                            this.$refs.versionDialog.show()
                        }
                    } else {
                        setVersion(VERSION);
                        this.$refs.versionDialog.show()
                    }
                }, 500)
            }
        },
        computed: {
            versionBody() {
                return `<div class="mm-dialog-text text-left">
版本号：${VERSION}（2019.03.24）<br/>
1、 优化滚动体验，缓存滚动位置<br>
2、 优化暂停 / 播放逻辑，减少重复请求
</div>`
            }
        },
        methods: {
            // 歌曲数据处理
            _formatSongs(list) {
                let ret = [];
                list.forEach((item) => {
                    const musicData = item;
                    if (musicData.id) {
                        ret.push(createTopList(musicData))
                    }
                });
                return ret
            },
            ...mapMutations({
                setAudioele: 'SET_AUDIOELE'
            }),
            ...mapActions([
                'setPlaylist'
            ])
        }
    }
</script>

<style lang="less">
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
