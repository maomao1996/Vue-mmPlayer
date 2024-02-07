import { mapGetters, mapMutations, mapActions } from 'vuex'

/**
 * 歌曲列表 -- 好像没有被用到
 */
export const listMixin = {
  computed: {
    ...mapGetters(['playing', 'currentMusic']),
  },
  methods: {
    selectItem_modified(item, index) {
      if (item.id === this.currentMusic.id && this.playing) {
        this.setPlaying(false)
      } else {
        this.selectPlay({
          list: this.list,
          index,
        })
      }
    },
    ...mapMutations({
      setPlaying: 'SET_PLAYING',
    }),
    ...mapActions(['selectPlay']),
  },
}

/**
 * loading状态
 * @type {{data(): *, methods: {_hideLoad(): void}}}
 */
export const loadMixin = {
  data() {
    return {
      mmLoadShow: true, // loading状态
    }
  },
  methods: {
    _hideLoad() {
      //不清楚这里为啥要用定时器,并且还要记录timer,还需要在setTimeout()之前clear??
      let timer
      clearTimeout(timer)
      timer = setTimeout(() => {
        this.mmLoadShow = false
      }, 200)
    },
  },
}
