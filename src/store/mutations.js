import * as types from './mutation-types'

const mutations = {
    //修改加载状态
    [types.SET_ISSHOW](state,isShow){
        console.log(isShow)
        state.isShow = isShow
    }
};

export default mutations
