<template>
    <!--正在播放-->
    <div class="playList">
        <mm-loading v-model="mmLoadShow"/>
        <music-list :list="playlist" :listType="1" @select="selectItem" @del="deleteItem">
            <div slot="listBtn" class="list-btn">
                <span @click="$refs.dialog.show()">清空列表</span>
            </div>
        </music-list>
        <mm-dialog ref="dialog" @confirm="clearList" bodyText="是否清空正在播放列表" confirmBtnText="清空"/>
    </div>
</template>

<script>
    import {mapGetters, mapMutations, mapActions} from 'vuex'
    import {topList, topListMm} from 'api'
    import MusicList from 'components/music-list/music-list'
    import MmLoading from 'base/mm-loading/mm-loading'
    import MmDialog from 'base/mm-dialog/mm-dialog'
    import {defaultSheetId} from 'assets/js/config'
    import {createTopList} from 'assets/js/song'
    import {loadMixin} from "assets/js/mixin";
    
    export default {
        name: "play-list",
        mixins: [loadMixin],
        data() {
            return {
                show: false,
            }
        },
        components: {
            MusicList,
            MmLoading,
            MmDialog
        },
        created() {
            if (this.playlist.length > 0) {
                this.mmLoadShow = false;
                return
            }
            topList(defaultSheetId)
            .then((res) => {
                if (res.status === 200) {
                    let list = this._formatSongs(res.data.playlist.tracks.slice(0,100));
                    this.setPlaylist({list});
                    this._hideLoad()
                }
            })
        },
        computed: {
            ...mapGetters([
                'playing',
                'playlist',
                'currentMusic',
                'audioEle'
            ])
        },
        methods: {
            // 清空列表事件
            clearList() {
                this.clearPlayList();
                this.$mmToast('列表清空成功')
            },
            // 播放暂停事件
            selectItem(item, index) {
                if (item.id === this.currentMusic.id && !this.playing) {
                    this.setPlaying(true);
                } else {
                    this.setCurrentIndex(index);
                    this.setPlaying(true)
                }
            },
            // 删除事件
            deleteItem(index) {
                let list = [...this.playlist];
                list.splice(index, 1);
                this.removerPlayListItem({list, index});
                this.$mmToast('删除成功')
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
            ...mapMutations({
                setPlaying: 'SET_PLAYING',
                setCurrentIndex: 'SET_CURRENTINDEX',
                clearPlaylist: 'CLEAR_PLAYLIST'
            }),
            ...mapActions([
                'setPlaylist',
                'removerPlayListItem',
                'clearPlayList'
            ])
        }
    }
</script>

<style lang="less">
    @import "~assets/css/var";
    
    .playList {
        position: relative;
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
