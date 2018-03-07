//随机排序数组 https://github.com/jashkenas/underscore/blob/master/underscore.js
function random(min, max) {
    if (max == null) {
        max = min;
        min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
}

export const randomSortArray = function (arr) {
    let length = arr.length,
        shuffled = Array(length);
    for (let index = 0, rand; index < length; index++) {
        rand = random(0, index);
        if (rand !== index) shuffled[index] = shuffled[rand];
        shuffled[rand] = arr[index];
    }
    return shuffled;
    
};
