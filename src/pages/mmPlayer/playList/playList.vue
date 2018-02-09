<template>
    <div class="playList">
        <music-list :list="playlist">
            <div slot="listBtn" class="list-btn">
                <span @click="click">清空列表</span>
            </div>
        </music-list>
    </div>
</template>

<script>
    import {mapGetters, mapMutations} from 'vuex'
    import {topList} from 'api/music'
    import MusicList from 'components/music-list/music-list'
    
    export default {
        name: "play-list",
        components: {
            MusicList
        },
        created() {
            if (this.playlist.length > 0) {
                return
            }
            topList(1)
                .then((res) => {
                    if (res.status === 200) {
                        this.setPlaylist(res.data.playlist.tracks)
                    }
                })
        },
        computed: {
            ...mapGetters([
                'playlist'
            ])
        },
        methods: {
            click() {
                this.clearPlaylist();
                this.$mmToast('列表清空成功')
            },
            ...mapMutations({
                setPlaylist: 'SET_PLAYLIST',
                clearPlaylist: 'CLEAR_PLAYLIST'
            })
        }
    }
</script>

<style lang="less" scoped>
    @import "../../../assets/css/var";
    
    .playList {
        width: 100%;
        height: 100%;
        .musicList {
            width: 100%;
            height: 100%;
            .list-btn {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 50px;
                span {
                    padding: 5px 20px;
                    cursor: pointer;
                    user-select: none;
                    &:hover {
                        color: @text_color_active;
                    }
                }
            }
        }
    }
</style>
