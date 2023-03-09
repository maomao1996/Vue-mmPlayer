<template>
  <!--评论-->
  <div class="comment" @scroll="listScroll($event)">
    <mm-loading v-model="mmLoadShow" />
    <dl v-if="hotComments.length > 0" class="comment-list">
      <!--精彩评论-->
      <dt class="comment-title">精彩评论</dt>
      <dd v-for="item in hotComments" :key="item.commentId" class="comment-item">
        <a target="_blank" :href="`https://music.163.com/#/user/home?id=${item.user.userId}`">
          <img v-lazy="`${item.user.avatarUrl}?param=50y50`" class="comment-item-pic" />
          <h2 class="comment-item-title">{{ item.user.nickname }}</h2>
        </a>
        <p class="comment-item-disc">{{ item.content }}</p>
        <div class="comment-item-opt">
          <span class="comment-opt-date">{{ item.time | format }}</span>
          <span class="comment-opt-liked">
            <mm-icon type="good" />
            {{ item.likedCount }}
          </span>
        </div>
      </dd>
    </dl>
    <!--最新评论-->
    <dl v-if="commentList.length > 0" class="comment-list">
      <dt class="comment-title">最新评论（{{ total }}）</dt>
      <dd v-for="item in commentList" :key="item.commentId" class="comment-item">
        <a
          class="comment-item-pic"
          target="_blank"
          :href="`https://music.163.com/#/user/home?id=${item.user.userId}`"
        >
          <img v-lazy="`${item.user.avatarUrl}?param=50y50`" class="cover-img" />
        </a>
        <h2 class="comment-item-title">
          <a target="_blank" :href="`https://music.163.com/#/user/home?id=${item.user.userId}`">
            {{ item.user.nickname }}
          </a>
        </h2>
        <p class="comment-item-disc">{{ item.content }}</p>
        <div
          v-for="beReplied in item.beReplied"
          :key="beReplied.user.userId"
          class="comment-item-replied"
        >
          <a
            target="_blank"
            :href="`https://music.163.com/#/user/home?id=${beReplied.user.userId}`"
          >
            {{ beReplied.user.nickname }}
          </a>
          ：{{ beReplied.content }}
        </div>
        <div class="comment-item-opt">
          <span class="comment-opt-date">{{ item.time | format }}</span>
          <span v-if="item.likedCount > 0" class="comment-opt-liked">
            <mm-icon type="good" />
            {{ item.likedCount }}
          </span>
        </div>
      </dd>
    </dl>
  </div>
</template>

<script>
import { getComment } from 'api'
import { addZero } from '@/utils/util'
import MmLoading from 'base/mm-loading/mm-loading'
import { loadMixin } from '@/utils/mixin'

export default {
  name: 'Comment',
  components: {
    MmLoading
  },
  filters: {
    // 格式化时间
    format(time) {
      let formatTime
      const date = new Date(time)
      const dateObj = {
        year: date.getFullYear(),
        month: date.getMonth(),
        date: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes()
      }
      const newTime = new Date()
      const diff = newTime.getTime() - time
      if (newTime.getDate() === dateObj.date && diff < 60000) {
        formatTime = '刚刚'
      } else if (newTime.getDate() === dateObj.date && diff > 60000 && diff < 3600000) {
        formatTime = `${Math.floor(diff / 60000)}分钟前`
      } else if (newTime.getDate() === dateObj.date && diff > 3600000 && diff < 86400000) {
        formatTime = `${addZero(dateObj.hours)}:${addZero(dateObj.minutes)}`
      } else if (newTime.getDate() !== dateObj.date && diff < 86400000) {
        formatTime = `昨天${addZero(dateObj.hours)}:${addZero(dateObj.minutes)}`
      } else if (newTime.getFullYear() === dateObj.year) {
        formatTime = `${dateObj.month + 1}月${dateObj.date}日`
      } else {
        formatTime = `${dateObj.year}年${dateObj.month + 1}月${dateObj.date}日`
      }
      return formatTime
    }
  },
  mixins: [loadMixin],
  data() {
    return {
      lockUp: true, // 是否锁定滚动加载事件,默认锁定
      page: 0, // 分页
      hotComments: [], // 精彩评论
      commentList: [], // 最新评论
      total: null // 评论总数
    }
  },
  watch: {
    commentList(newList, oldList) {
      if (newList.length !== oldList.length) {
        this.lockUp = false
      }
    }
  },
  created() {
    this.initData()
  },
  methods: {
    // 初始化数据
    initData() {
      getComment(this.$route.params.id, this.page).then((res) => {
        this.hotComments = res.hotComments
        this.commentList = res.comments
        this.total = res.total
        this.lockUp = true
        this._hideLoad()
      })
    },
    // 列表滚动事件
    listScroll(e) {
      if (this.lockUp) {
        return
      }
      const { scrollTop, scrollHeight, offsetHeight } = e.target
      if (scrollTop + offsetHeight >= scrollHeight - 100) {
        this.lockUp = true // 锁定滚动加载
        this.page += 1
        this.pullUp() // 触发滚动加载事件
      }
    },
    // 滚动加载事件
    pullUp() {
      getComment(this.$route.params.id, this.page).then(({ comments }) => {
        this.commentList = [...this.commentList, ...comments]
      })
    }
  }
}
</script>

<style lang="less" scoped>
.comment {
  .comment-list {
    padding: 0 10px;
  }

  .comment-title {
    position: sticky;
    top: 0;
    z-index: 1;
    margin: 0 -10px;
    padding: 10px;
    height: 34px;
    line-height: 34px;
    color: @text_color_active;
    background: @header_bg_color;
    backdrop-filter: @backdrop_filter;
  }
  .comment-item {
    position: relative;
    padding: 15px 0 15px 55px;
    & + .comment-item {
      border-top: 1px solid @comment_item_line_color;
    }
    &-pic {
      display: block;
      position: absolute;
      left: 0;
      top: 20px;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      overflow: hidden;
    }
    &-title {
      height: 20px;
      margin-bottom: 6px;
      font-weight: 400;
      .no-wrap();
      color: @text_color_active;
    }
    &-disc {
      overflow: hidden;
      word-break: break-all;
      word-wrap: break-word;
      line-height: 25px;
      text-align: justify;
      color: @text_color;
      img {
        position: relative;
        vertical-align: middle;
        top: -2px;
      }
    }
    &-replied {
      padding: 8px 19px;
      margin-top: 10px;
      line-height: 20px;
      border: 1px solid @comment_replied_line_color;
      a {
        color: @text_color_active;
      }
    }
    &-opt {
      margin-top: 10px;
      line-height: 25px;
      text-align: right;
      overflow: hidden;
      .comment-opt-date {
        float: left;
        line-height: 28px;
      }
      .comment-opt-liked {
        display: inline-block;
        height: 20px;
        line-height: 20px;
      }
    }
  }
}
</style>
