let obj = {
  0: 1,
  1: 2,
  //   迭代器
  //   [Symbol.iterator]() {
  //     let index = 0;
  //     return {
  //       next: () => {
  //         return {
  //           value: this[index],
  //           done: this.length === index++,
  //         };
  //       },
  //     };
  //   },
  //   生成器
  *[Symbol.iterator]() {
    for (let i = 0; i < this.length; i++) {
      yield this[i];
    }
  },
  length: 2,
};

// console.log([...obj]); //行不通  需要添加iterator
// console.log(Array.from(obj));

// 当发送网络请求的时候，需要拿到这次网络请求的数据，再发
// 送网络请求，就这样重复三次，才能拿到我最终的结果。

// 方案一：嵌套写法看着很恶心，不采用
// 方案二：也不考虑返回Promise使用then连续调用的形式

// 现在的任务是解决这种嵌套的代码形式

// 读取文件函数
function requestData(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (url.includes("iceweb")) {
        resolve(url);
      } else {
        reject("请求错误");
      }
    }, 1000);
  });
}

// 方案三 生成器 + Promise
function* getData(url) {
  let result = yield requestData(url);
  let result2 = yield requestData(result);
  let result3 = yield requestData(result2);
  console.log(result3);
}
// 每次调用generator.next()，都会执行到对应的yield然后停止，
// 像let result = yield requestData(url);因为是先执行右边的，有结果了再赋值给result
// 所以第一次执行结束还没有完成赋值，也就是此时result为undefined,且每次next(arg),arg将
// 被作为上一次yield的结果

// const generator = getData("iceweb.io");
//打印结果是一个对象：{ value: Promise { <pending> }, done: false }
// requestData(url)会返回一个promise,作为value的值
// console.log(generator.next());  

// 看着也挺抽象的
// generator
//   .next()
//   .value.then((data) =>
//     generator
//       .next(`iceweb.org${data}`)
//       .value.then((data) =>
//         generator.next(`iceweb.com${data}`).value.then((data) => generator.next(data))
//       )
//   );

// getData已经变为同步的形式，可以拿到我最终的结果了。generator虽然一直在调
// 用.next看起来似乎也产生了回调地狱，其实不用关心这个，因为它这个是有规律的，我们可
// 以封装成一个自动化执行的函数，内部是如何调用的我们就不用关心了。


// 方案四：自动化执行函数封装
// function* getData() {
//   const res1 = yield requestData('iceweb.io')
//   const res2 = yield requestData(`iceweb.org ${res1}`)
//   const res3 = yield requestData(`iceweb.com ${res2}`)

//   console.log(res3)
// }

// function asyncAutomation(genFn){
//   let generator = genFn();

//   const _automation = (result) => {
//     let nextData = generator.next(result)
//     if(nextData.done) return 
//     nextData.value.then((data)=>{
//       _automation(data)
//     })
//   }

//   _automation()
// }

// asyncAutomation(getData)

// 方案四(最终解决方案)：async + await
function requestData(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (url.includes('iceweb')) {
        resolve(url)
      } else {
        reject('请求错误')
      }
    }, 1000);
  })
}

async function getData(url){
  let result = await requestData(url)
  let result2 = await requestData(`iceweb.org${result}`)
  let result3 = await requestData(`iceweb.com${result2}`)
  console.log(result3);
}

getData('iceweb.io')
// 哈人，只要把getData生成器函数，改为async函数，yeild的关键
// 字替换为await就可以实现异步代码同步写法了。