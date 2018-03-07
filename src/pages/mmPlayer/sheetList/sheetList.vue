<template>
    <div class="playList">
    
    </div>
</template>

<script>
    export default {
        name: "play-list",
        data() {
            return {
                currentList: [],//音乐列表
                historyList: [],//播放历史
            }
        }
    }
</script>

<style lang="less" scoped>
    .playList {
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
    }
</style>
