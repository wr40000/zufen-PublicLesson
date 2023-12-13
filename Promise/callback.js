function say(who) {
  console.log(who + "说话");
}
Function.prototype.before = function (cb) {
  // 写法一
  //   return function () {
  //     cb();
  //     this(); //有this指向问题  可在外侧let that = this
  //   };
  // 写法二  采用ES6解决this指向
  return (...arg) => {
    console.log("arg: ", arg);
      cb();
      // console.log("this: ", this);
      // this(...arg)
  }
};
let newFn = say.before(function () {
  console.log("说话前");
});

newFn('Terraria');
