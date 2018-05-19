<template>
    <!--歌单详情-->
    <div class="details">
        <mm-loading v-model="mmLoadShow"/>
        <music-list :list="list" @select="selectItem"/>
    </div>
</template>

<script>
    import {mapActions} from 'vuex'
    import {topListMm} from 'api'
    import MmLoading from 'base/mm-loading/mm-loading'
    import MusicList from 'components/music-list/music-list'
    import {createTopList} from 'assets/js/song'
    import {loadMixin} from "assets/js/mixin"
    
    export default {
        name: "detail",
        mixins: [loadMixin],
        components: {
            MmLoading,
            MusicList
        },
        data() {
            return {
                list: [],//列表
            }
        },
        created() {
            // 获取歌单详情
            topListMm(this.$route.params.id)
                .then((res) => {
                    this.list = this._formatSongs(res.data.playlist.tracks);
                    document.title = `${res.data.playlist.name} - mmPlayer在线音乐播放器`;
                    this._hideLoad()
                })
        },
        methods: {
            // 播放暂停事件
            selectItem(item, index) {
                this.selectPlay({
                    list: this.list,
                    index
                })
            },
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
            ...mapActions([
                'selectPlay'
            ])
        }
    }
</script>

<style lang="less" scoped>
    .details {
        position: relative;
        width: 100%;
        height: 100%;
        .musicList {
            width: 100%;
            height: 100%;
        }
    }
</style>
