<template>
    <!--评论-->
    <div class="comment">
        <mm-loading v-model="mmLoadShow"/>
        <dl v-if="hotComments.length > 0" class="comment-list" @scroll="listScroll($event)">
            <!--精彩评论-->
            <dt class="comment-title">精彩评论</dt>
            <dd class="comment-item" v-for="item in hotComments" :key="item.commentId">
                <img class="comment-item-pic" v-lazy="`${item.user.avatarUrl}?param=50y50`"/>
                <h2 class="comment-item-title">
                    <a target="_blank" :href="`http://music.163.com/#/user/home?id=${item.user.userId}`">{{item.user.nickname}}</a>
                </h2>
                <p class="comment-item-disc">{{item.content}}</p>
                <div class="comment-item-opt">
                    <span class="comment-opt-date">{{item.time | format}}</span>
                    <span class="comment-opt-liked">{{item.likedCount}}</span>
                </div>
            </dd>
            <!--最新评论-->
            <dt class="comment-title">最新评论（{{total}}）</dt>
            <dd class="comment-item" v-for="item in commentList" :key="item.commentId">
                <a class="comment-item-pic" target="_blank"
                   :href="`http://music.163.com/#/user/home?id=${item.user.userId}`">
                    <img class="cover-img" v-lazy="`${item.user.avatarUrl}?param=50y50`"/>
                </a>
                <h2 class="comment-item-title">
                    <a target="_blank" :href="`http://music.163.com/#/user/home?id=${item.user.userId}`">{{item.user.nickname}}</a>
                </h2>
                <p class="comment-item-disc">{{item.content}}</p>
                <div class="comment-item-replied" v-for="beReplied in item.beReplied">
                    <a target="_blank" :href="`http://music.163.com/#/user/home?id=${beReplied.user.userId}`">{{beReplied.user.nickname}}</a>
                    ：{{beReplied.content}}
                </div>
                <div class="comment-item-opt">
                    <span class="comment-opt-date">{{item.time | format}}</span>
                    <span class="comment-opt-liked" v-if="item.likedCount>0">{{item.likedCount}}</span>
                </div>
            </dd>
        </dl>
    </div>
</template>

<script>
    import {getComment} from 'api'
    import {addZero} from 'assets/js/util'
    import MmLoading from 'base/mm-loading/mm-loading'
    import {loadMixin} from "assets/js/mixin";
    
    export default {
        name: "comment",
        mixins: [loadMixin],
        components: {
            MmLoading
        },
        data() {
            return {
                lockUp: true,// 是否锁定滚动加载事件,默认锁定
                page: 0,// 分页
                hotComments: [],// 精彩评论
                commentList: [],// 最新评论
                total: null,// 评论总数
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
                getComment(this.$route.params.id, this.page)
                .then(res => {
                    if (res.data.code === 200) {
                        this.hotComments = res.data.hotComments;
                        this.commentList = res.data.comments;
                        this.total = res.data.total;
                        this.lockUp = true;
                        this._hideLoad()
                    }
                })
            },
            //列表滚动事件
            listScroll(e) {
                if (this.lockUp) {
                    return
                }
                let scrollTop = e.target.scrollTop,
                    scrollHeight = e.target.scrollHeight,
                    height = e.target.offsetHeight;
                if (scrollTop + height >= scrollHeight) {
                    this.lockUp = true;//锁定滚动加载
                    this.page += 1;
                    this.pullUp()//触发滚动加载事件
                }
            },
            //滚动加载事件
            pullUp() {
                getComment(this.$route.params.id, this.page)
                .then(res => {
                    if (res.data.code === 200) {
                        this.commentList = [...this.commentList, ...res.data.comments];
                    }
                })
            }
        },
        filters: {
            // 格式化时间
            format(time) {
                let formatTime;
                const date = new Date(time);
                const dateObj = {
                    year: date.getFullYear(),
                    month: date.getMonth(),
                    date: date.getDate(),
                    hours: date.getHours(),
                    minutes: date.getMinutes()
                };
                const newTime = new Date();
                const diff = newTime.getTime() - time;
                if (newTime.getDate() === dateObj.date && diff < 60000) {
                    formatTime = '刚刚'
                } else if (newTime.getDate() === dateObj.date && 60000 < diff && diff < 3600000) {
                    formatTime = `${Math.floor(diff / 60000) }分钟前`
                } else if (newTime.getDate() === dateObj.date && 3600000 < diff && diff < 86400000) {
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
        }
    }
</script>

<style lang="less" scoped>
    @import "~assets/css/var";
    @import "~assets/css/mixin";
    
    .comment {
        position: relative;
        transform: translate3d(0, 0, 0);
        width: 100%;
        height: 100%;
        overflow: hidden;
        .comment-list {
            height: 100%;
            padding: 0 10px;
            overflow-x: hidden;
            overflow-y: auto;
            .comment-title {
                height: 34px;
                line-height: 34px;
                padding: 10px 0;
                color: @text_color_active;
                border-bottom: 1px solid @comment_head_line_color;
            }
            .comment-item {
                position: relative;
                padding: 15px 0 15px 55px;
                border-bottom: 1px solid @comment_item_line_color;
                .comment-item-pic {
                    display: block;
                    position: absolute;
                    left: 0;
                    top: 20px;
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    overflow: hidden;
                }
                .comment-item-title {
                    height: 20px;
                    margin-bottom: 6px;
                    font-weight: 400;
                    .no-wrap();
                    color: @text_color_active;
                }
                .comment-item-disc {
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
                .comment-item-replied {
                    padding: 8px 19px;
                    margin-top: 10px;
                    line-height: 20px;
                    border: 1px solid @comment_replied_line_color;
                    a {
                        color: @text_color_active;
                    }
                }
                .comment-item-opt {
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
                        padding-left: 23px;
                        height: 20px;
                        line-height: 20px;
                        background-image: url("~assets/img/comment.png");
                        background-repeat: no-repeat;
                        background-size: contain;
                    }
                }
            }
        }
    }
</style>
