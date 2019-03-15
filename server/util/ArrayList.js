exports.ArrayList = function () {
    this.arr = [],
        this.size = function () {
            return this.arr.length;
        },
        this.add = function () {
            if (arguments.length == 1) {
                this.arr.push(arguments[0]);
            } else if (arguments.length >= 2) {
                var deleteItem = this.arr[arguments[0]];
                this.arr.splice(arguments[0], 1, arguments[1], deleteItem)
            }
            return this;
        },
        this.get = function (index) {
            return this.arr[index];
        },
        this.removeIndex = function (index) {
            this.arr.splice(index, 1);
        },
        this.removeObj = function (obj) {
            this.removeIndex(this.indexOf(obj));
        },
        this.indexOf = function (obj) {
            for (var i = 0; i < this.arr.length; i++) {
                if (this.arr[i] === obj) {
                    return i;
                };
            }
            return -1;
        },
        this.isEmpty = function () {
            return this.arr.length == 0;
        },
        this.clear = function () {
            this.arr = [];
        },
        this.contains = function (obj) {
            return this.indexOf(obj) != -1;
        }
        this.moveTop=function (obj) {
            var index = this.indexOf(obj)
            if(index == -1){
                return index;
            }
            if(this.size() == 0){
                return -1;
            }
            var temp = arr[0];
            arr[0] = arr[index];
            arr[index] = temp;
          }
}