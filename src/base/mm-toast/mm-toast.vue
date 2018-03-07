<template>
    <transition name="toast-fade">
        <div v-show="visible" class="mm-toast" :class="positionClasss">{{message}}</div>
    </transition>
</template>

<script>
    export default {
        name: "mm-toast",
        data() {
            return {
                position: 'center',//默认显示位置
                message: 'Hello World',
                duration: 2000,
                visible: false,
            }
        },
        computed: {
            positionClasss() {
                return 'mm-toast-' + this.position
            }
        }
    }
</script>

<style lang="less">
    .mm-toast {
        position: fixed;
        left: 50%;
        z-index: 1996;
        max-width: 80%;
        box-sizing: border-box;
        border-radius: 5px;
        padding: 10px 20px;
        overflow: hidden;
        text-align: center;
        height: 40px;
        line-height: 20px;
        font-size: 14px;
        color: #fff;
        background: rgba(0, 0, 0, .5);
        user-select: none;
        transform: translateX(-50%);
        &.mm-toast-top {
            top: 10%;
        }
        &.mm-toast-center {
            top: 50%;
            margin-top: -20px;
        }
        &.mm-toast-bottom {
            bottom: 10%;
        }
    }
    
    .toast-fade-enter {
        opacity: 0;
        transform: translate3d(-50%, -10px, 0);
    }
    
    .toast-fade-enter-active {
        will-change: transform;
        transition: all .3s;
    }
    
    .toast-fade-enter-to {
        opacity: 1;
        transform: translate3d(-50%, 0, 0);
    }
</style>
