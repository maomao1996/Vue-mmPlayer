<template>
    <div class="topList">
        <mm-loading v-model="show" :loadingBgColor="'rgba(0,0,0,.6)'"></mm-loading>
        <div class="list-item" v-for="(item,index) in list" :key="index" :title="item.name+item.updateFrequency">
            <router-link :to="{path:'/music/details',query:{id:item.id}}" tag="div" class="topList-item">
                <img class="cover-img" :src="item.coverImgUrl+'?param=200y200'">
                <h3 class="name">{{item.name}}</h3>
            </router-link>
        </div>
    </div>
</template>

<script>
    import {getToplistDetail} from 'api/music'
    import MmLoading from 'base/mm-loading/mm-loading'
    export default {
        name: "play-list",
        components: {
            MmLoading
        },
        data() {
            return {
                show: true,//loading
                list: [],//列表
            }
        },
        created() {
            getToplistDetail().then( (res) => {
                if(res.status === 200) {
                    this.list = res.data.list;
                    let timer;
                    clearTimeout(timer);
                    timer = setTimeout(()=>{
                        this.show = false
                    },200)
                }
            })
        }
    }
</script>

<style lang="less" scoped>
    @import "../../../assets/css/var";
    @import "../../../assets/css/mixin";
    .topList {
        position: relative;
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        .list-item {
            float: left;
            width: calc(~'100% / 6');
            .topList-item {
                width: 80%;
                margin: 0 auto 20px;
                text-align: center;
                cursor: pointer;
                &:hover {
                    color: #fff;
                }
                .name {
                    height: 30px;
                    line-height: 30px;
                    font-size: @font_size_medium;
                    .no-wrap();
                }
            }
            @media (max-width: 1400px){
                width: calc(~'100% / 5');
            }
            @media (max-width: 1280px){
                width: calc(~'100% / 4');
            }
            @media (max-width: 1100px){
                width: calc(~'100% / 3');
            }
            @media (max-width: 960px) and (min-width: 768px){
                width: calc(~'100% / 4');
            }
        }
    }
</style>
