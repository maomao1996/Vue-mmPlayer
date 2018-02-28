<template>
    <div class="details">
        <mm-loading v-model="show" :loadingBgColor="'rgba(0,0,0,.6)'"></mm-loading>
        <music-list :list="list"></music-list>
    </div>
</template>

<script>
    import {topListMm} from 'api/music'
    import MmLoading from 'base/mm-loading/mm-loading'
    import MusicList from 'components/music-list/music-list'
    import {createTopList} from 'assets/js/song'
    
    export default {
        name: "detail",
        components: {
            MmLoading,
            MusicList
        },
        data() {
            return {
                show: true,//loading
                list: [],//列表
            }
        },
        created() {
            topListMm(this.$route.query.id)
                .then((res) => {
                    this.list = this._formatSongs(res.data.playlist.tracks);
                    let timer;
                    clearTimeout(timer);
                    timer = setTimeout(()=>{
                        this.show = false
                    },200)
                })
        },
        methods: {
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
