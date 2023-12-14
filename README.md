[TOC]

# 珠峰手写Promise

## 前置编程思想

### AOP--面向切片编程

```
参考资料
https://juejin.cn/post/7011797590207365128
https://juejin.cn/post/6844903796129136654
```

![image-20231211202652051](README.assets/image-20231211202652051.png)

面向切面的程序设计（Aspect-oriented programming，AOP，又译作面向方面的程序设计、剖面导向程序设计）是计算机科学中的一种程序设计思想，旨在将横切关注点与业务主体进行进一步分离，以提高程序代码的模块化程度。面向切面的程序设计思想也是面向切面软件开发的基础。切面的概念源于对面向对象的程序设计和计算反射的融合，但并不只限于此，它还可以用来改进传统的函数。与切面相关的编程概念还包括元对象协议、主题（Subject）、混入（Mixin）和委托（Delegate）。

面向切面编程为我们提供了一种将代码注入现有函数或对象的方法，而无需修改目标逻辑。

注入的代码虽然不是必需的，但在具有横切关注点的，例如添加日志记录功能、调试元数据、性能统计、安全控制、事务处理、异常处理或不那么通用的功能，可以在不影响原始代码的情况下注入额外的行为。把它们抽离出来，用“动态”插入的方式嵌到各业务逻辑中。业务模块可以变得比较干净，不受污染，同时这些功能点能够得到很好的复用，给模块解耦。

![image-20231213102440106](README.assets/image-20231213102440106.png)

```js
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
```

- 上面的代码，在**Function**的原型上添加方法**before**，接受一个函数作为参数，且返回一个函数，所以调用**newFn**也将返回一个函数

- 在**before**的内部，我们可以先调用传入的函数，在使用**this()**调用**say**方法，因为这里是箭头函数，所以**this**也就是**say**, 使用**ES5**的写法则需要使用 **let that = this**

- 为什么**...arg**可以接收到**newFn('Terraria')**中的参数，因为**newFnqi**其实是函数

  - ```js
    (...arg) => {
        console.log("arg: ", arg);
          cb();
          // console.log("this: ", this);
          // this(...arg)
      }
    ```

    newFn('Terraria')也就是相当是：

    ```js
    (() => {
        console.log("arg: ", arg);
          cb();
          // console.log("this: ", this);
          // this(...arg)
      })('Terraria')
    ```

    所以 **...arg**可以接受到所有传入的参数，并将其封装到一个数组里

### 事件发布&订阅

我的理解是：

- 首先有一个保存订阅的事件的数组
- 有一个方法要将订阅的事件添加到数组里
- 在时机成熟时有一个方法要对数组的里方法进行触发
- 最好是把这些逻辑封装成一个对象

下面的代码中的 **event** 实现的基本就是这样

先订阅事件，事件触发时，再根据内部的逻辑判断执行哪些事件

```js
let fs = require('fs');

let event = {
    _arr: [],
    on(cb){
        this._arr.push(cb);
    },
    emit(){
        this._arr.forEach(cb => cb())
    }
}

let player = []
event.on(function(){
    console.log("读取一个");
})
event.on(function(){
    if(player.length == 2 ){
        console.log('over player: ', player);
    }
})

fs.readFile('.\/1.txt', 'utf8', (err, data)=>{
    player.push(data)
    event.emit()
})
fs.readFile('./2.txt', 'utf8', (err, data)=>{
    player.push(data)
    event.emit()
})
```

### 观察者模式

**观察者模式的一个优点是实现了观察者和被观察者的解耦，被观察者不需要知道观察者的具体细节，只需要通知观察者即可。这有助于代码的灵活性和可维护性。**

挺像Vue2中的依赖收集

- 有一个观察者实例和一个被观察者实例
- 被观测者在内部有一个保存着谁在观测他其的数组
- 被观测者在内部有一个更新状态的方法，一旦状态更新，该方法会通知所有观察者数组的成员，并将新的状态传递过去，也就是带着新的状态触发观测者的方法，实现响应式

下面的例子，宝宝实例会将爸爸和妈妈的实例对象先加入观测者的数组，当宝宝状态发生改变，通知数组里的成员并携带着新状态去调用相关方法

```js
class Subject{
    constructor(){
        this.state = '开心的一批'
        this.arr = []
    }
    attach(o){
        this.arr.push(o)
    }
    setState(newValue){
        this.state = newValue;
        this.arr.forEach(o => o.updata(newValue))
    }
}
// 观察者
class Observer{
    constructor(name){
        this.name = name
    }
    updata(newValue){
        console.log("name: " + this.name + ',    baby状态是: ' + newValue);
    }
}

let baby = new Subject;
let mm = new Observer('宝宝他妈');
let bb = new Observer('宝宝他爸');
baby.attach(mm)
baby.attach(bb)
baby.setState("困得一批")
```

### 装饰器模式

称为"装饰器模式"（Decorator Pattern）

装饰器模式是一种结构型设计模式，允许通过将对象放入包装对象中来动态地扩展其行为。在这里，`perform` 函数接受两个参数：`anyMethods` 和 `wrappers`。

- `anyMethods` 是一个函数，代表了要执行的具体操作。
- `wrappers` 是一个包含了多个装饰器对象的数组，每个装饰器对象都有 `initialize` 和 `close` 方法，分别在操作执行前后进行一些初始化和清理工作。

在 `perform` 函数内部，首先通过循环调用 `wrappers` 数组中每个装饰器的 `initialize` 方法，然后执行 `anyMethods` 函数，最后再次循环调用 `wrappers` 数组中每个装饰器的 `close` 方法。

这样一来，通过使用装饰器模式，你可以在不修改原始操作（`anyMethods`）的情况下，动态地添加一些前置和后置的功能，以满足不同的需求。这种模式可以使代码更加灵活和可扩展。

```js
function perform(anyMethods, wrappers) {
  wrappers.forEach((wrapper) => wrapper.initialize());
  anyMethods();
  wrappers.forEach((wrapper) => wrapper.close());
}

perform(
  function () {
    console.log("say");
  },
  [
    {
      initialize() {
        console.log("say前");
      },
      close() {
        console.log("say后");
      },
    },
    {
      initialize() {
        console.log("say前前");
      },
      close() {
        console.log("say后后");
      },
    },
  ]
);
```



## 手写Promise

- new Promise失败状态也会reject

- 官方术语

  - promise 是一个有then方法的对象或者是函数，行为遵循本规范

  - thenable 是一个有then方法的对象或者是函数

  - value 是promise状态成功时的值，包括 undefined/thenable或者是 promise

  - exception 是一个使用throw抛出的异常值

  - reason 是promise状态失败时的值

### 首先初始化状态和方法

```js
  constructor(executor) {
    this.state = PENDING;
    this.value = undefined; // 成功的结果
    this.reason = undefined; // 失败的原因
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    let resolve = (value) => { //添加判断，状态一旦更改就不可变
      if ((this.state === PENDING)) {
        this.state = RESOLVE;
        this.value = value;
        this.onResolvedCallbacks.forEach((cb) => cb());
      }
    };
    let reject = (reason) => {
      if ((this.state === PENDING)) {
        this.state = REJECT;
        this.reason = reason;
        this.onRejectedCallbacks.forEach((cb) => cb());
      }
    };
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
```

- **resolve reject**添加判断，状态一旦更改就不可变
- **this.onResolvedCallbacks = [] ：** 当promise还是pending状态时调用then方法时，显然不适合触发其中的方法，所以将then方法里的函数存放在自身的一个队列里，当状态发生改变，会去调用resolve,这时再执行该数组里的方法
- **this.onRejectedCallbacks：** 同理，失败时调用reject,后再清空其中的方法即可

- 立即执行函数要求上来就执行，使用try..catch...捕获错误

### then方法

- then接收一个成功的方法，一个失败的方法，且返回的是一个Promise,因为then是可以连续调用的

- 因为函数不是必传的，所以要判断，没有传就直接分别传递一下**value reason**即可

  - ​	

    ```js
    onfulfilled =
        typeof onfulfilled === "function" ? onfulfilled : (data) => data;
    onrejected =
        typeof onrejected === "function"
        ? onfulfilled
    : (err) => {
        throw new Error(err);
    };
    ```

- then返回的还是promise,根据上一步的状态来决定是调用 **onfulfilled 还是 onrejected**

  - **定时器的作用：** 因为在 **let promise2**的内部调用了 **promise2**,所以要加上定时器异步获取 **promise2**

  - **定时器里面使用try...catch..：**如果在定时器里的逻辑发生错误了，**constructor**里的try...catch...是无法捕获的，因为加上定时器后，这已经是个异步任务了

  - **调用then的promise状态是成功**，则用定时器将回调函数包裹成自执行函数，失败同理

    ```js
    if (this.state === RESOLVE) {
        setTimeout(() => {
            try {
                let x = onfulfilled(this.value);
                resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
                reject(e);
            }
        }, 0);
    }
    ```

  - **调用then的promise状态是pending：** 将then中的回调用定时器包装成自执行函数后，外面再包装成一个函数，并放到调用该then方法的promise的**onResolvedCallbacks 和 onRejectedCallbacks**

    ```js
    if (this.state === PENDING) {
        this.onResolvedCallbacks.push(() => {
            setTimeout(() => {
                try {
                    let x = onfulfilled(this.value);
                    resolvePromise(promise2, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            }, 0);
        });
        this.onRejectedCallbacks.push(() => {
            setTimeout(() => {
                try {
                    let x = onrejected(this.reason);
                    resolvePromise(promise2, x, resolve, reject);
                } catch (e) {
                    reject(e);
                }
            }, 0);
        });
    }
    ```

    

  - **判断then成功或失败回调的返回值是否是Promise,解决链式调用的异步：**问题这里有个问题要解决，因为要在你不能确定经过 **onfulfilled **后返回的x值是普通值还是仍然是一个 Promise,如果是个promise就必须要根据x的状态来执行后续then的回调，保证异步任务的顺序执行，所以添加方法 **resolvePromise(promise2, x, resolve, reject);** 用以判定异步任务执行的逻辑

    - 因为如果是普通值，显然直接 **resolve**即可

    - 但是如果 **x** 是个promise, 那么显然要**根据x的状态来决定后续还有then方法的连续调用中的方法执行顺序**，对于这种情况，是**什么时候**将后续then调用中的方法放入onResolvedCallbacks 或者onRejectedCallbacks里的呢？

      在**resolvePromise**中，如果x是promise，有这样一段代码:

      ```js
      then.call(
          x,
          (y) => {
              if (called) {
                  return;
              }
              called = true;
              resolvePromise(promise2, y, resolve, reject);
          },
          (r) => {
              if (called) {
                  return;
              }
              called = true;
              reject(r);
          }
      );
      ```

      显然，**如果x是promise,将会调用它的then方法，且将this指向x**，也就是确定是调用了x.then，所以对于后续的then的链式调用就会根据x的状态，**以事件发布订阅的思想基于x的状态的改变来调用数组的方法**

    - 对于x.then的返回值还是promise的情况，采用递归
    - called的作用是使回调只能被调用一次

### GPT问答--重要

- **then中的this：**对于 `then` 返回的新的 Promise 对象，其中的 `this` 确实指向调用 `then` 方法的原始 Promise 对象。这是因为 `then` 方法的设计是基于链式调用的，新的 Promise 对象是由 `then` 方法生成的，而该方法是在原始 Promise 对象上调用的。

  对于状态传递和成功/失败值的正确传递的作用：

  - **状态传递：** 在 Promise 链中，`then` 方法返回的新 Promise 对象的状态取决于前一个 Promise 对象的状态。如果前一个 Promise 对象是 resolved，新的 Promise 对象将会变为 resolved，并且会执行 `onfulfilled` 回调；如果前一个 Promise 对象是 rejected，新的 Promise 对象将会变为 rejected，并且会执行 `onrejected` 回调。这种状态的传递是通过 `this` 来实现的，确保新的 Promise 对象与前一个 Promise 对象相互关联。
  - **成功的 value 和失败的 reason 传递：** 当前一个 Promise 对象的状态为 resolved 时，`onfulfilled` 回调的返回值会成为新的 Promise 对象的解决值；当前一个 Promise 对象的状态为 rejected 时，`onrejected` 回调的返回值（或者抛出的错误）会成为新的 Promise 对象的拒绝原因。这里的传递也是基于 `this` 指向的关系。

  例如，在 `p.then(onfulfilled, onrejected)` 中，`onfulfilled` 和 `onrejected` 中的 `this` 都指向调用 `then` 方法的原始 Promise 对象 `p`。这使得在这些回调函数中可以访问到原始 Promise 对象的状态和值。

  总的来说，`this` 的正确指向确保了 Promise 链中的状态传递和成功/失败值的正确传递。这是 Promise 链式调用的关键机制。

- ​	**if ((typeof x === "object" && typeof x !== null) || typeof x === "function")是什么作用**：

  - 这行代码用于判断 `x` 是否是一个对象（除了 `null` 外）或者一个函数。这是在 `resolvePromise` 函数中对于 `x` 类型的判断。

    具体来说：

    - `typeof x === "object"`：首先判断 `x` 的类型是否为对象。这可以用于检查 `x` 是否是一个普通对象，因为 `typeof null` 也是 "object"，所以这一部分条件还需要加上 `&& typeof x !== null` 来排除 `null`。
    - `|| typeof x === "function"`：这一部分用于检查 `x` 是否是一个函数。这是因为在 JavaScript 中，函数也被认为是一种特殊的对象类型。

    综合起来，这个条件语句是为了判断 `x` 是否是一个对象（除了 `null` 外）或者一个函数。如果是这两种类型之一，就认为 `x` 可能是一个 Promise 对象，需要进行进一步的处理。这个判断在实现 Promise 链式调用和异步操作时非常重要。如果 `x` 是一个对象，那么可能具有 `then` 方法，我们需要根据它的状态来决定新 Promise 对象的状态和值。

- ​		

- 每个返回的promise都有自己的 **onResolvedCallbacks` 和 `onRejectedCallbacks**

  - 其实想想也是，如果所有待执行任务都放在一个**onResolvedCallbacks**和一个 **onRejectedCallbacks**里，每个自执行函数里的this指向也会出现问题，毕竟this.value来自调用then的promise

  - 每个 `then` 调用返回的新的 Promise 对象都有自己独立的 `onResolvedCallbacks` 和 `onRejectedCallbacks` 数组。这两个数组是为了存放该 Promise 对象的状态变为 resolved 或 rejected 时需要执行的回调函数。

    所以，不同的 Promise 对象之间的这两个数组是相互独立的，互不干扰。每个 Promise 对象都有自己的一组回调函数，这确保了在链式调用中每个 Promise 对象都能够按照正确的顺序执行自己的回调函数，而不会产生相互干扰的情况。

- 调用 **pending** 状态的Promise

  - 在 Promise 的实现中，`then` 方法的回调函数确实会被放入调用它的 Promise 的任务队列中。这确保了 `then` 中的回调函数在适当的时机执行，符合 Promise 的异步执行特性。

    当 `then` 方法被调用时，它会将 `onResolvedCallbacks` 或 `onRejectedCallbacks` 中的回调函数包装成一个延迟执行的函数，并将这个延迟执行的函数放入任务队列中。这是通过 `setTimeout` 或者类似的异步机制来实现的。

    具体代码可以参考你提供的 Promise 实现中的以下部分：

    ```js
    if (this.state == PENDING) {
      this.onResolvedCallbacks.push(() => {
        setTimeout(() => {
          try {
            let x = onfulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      });
    
      // 省略其他代码
    }
    ```

    在上述代码中，`setTimeout` 的调用就是为了将回调函数放入任务队列中，以确保在当前 JavaScript 执行栈执行完成后，回调函数才会被执行。这符合 Promise 的异步执行特性，确保了回调函数在适当的时机执行。

- **立刻执行函数写为箭头函数**
  - ​	箭头函数的一个特性是它继承了外层函数的 `this`。在 `new Promise` 的执行器函数中，`resolve` 和 `reject` 是通过函数参数传递的。使用箭头函数确保在箭头函数内部可以访问到外层函数的 `this`，也就是 `new Promise` 创建的 Promise 实例，从而可以调用 `resolve` 和 `reject` 方法。

- 关于 **resolve reject** 的命名
  - `resolve` 和 `reject` 只是通用的命名约定，用于表示 Promise 的状态变更。实际上，你可以使用任何合法的标识符作为这两个函数的名称，只要它们在执行器函数中被正确调用就可以。



### Promise A+ 测试

结果：**好好好**

有专门的测试脚本可以测试所编写的代码是否符合PromiseA+的规范。

首先，在promise实现的代码中，增加以下代码:

```
复制代码
Promise.defer = Promise.deferred = function () {
    let dfd = {};
    dfd.promise = new Promise((resolve, reject) => {
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd;
}
```

安装测试脚本:

```
复制代码npm install -g promises-aplus-tests
```

如果当前的promise源码的文件名为promise.js

那么在对应的目录执行以下命令:

```
复制代码promises-aplus-tests promise.js
```

promises-aplus-tests中共有872条测试用例。以上代码，可以完美通过所有用例。



### Promise其他方法

#### Promise.resolve

Promise.resolve(value) 返回一个以给定值解析后的Promise 对象.

1. 如果 value 是个 thenable 对象，返回的promise会“跟随”这个thenable的对象，采用它的最终状态
2. 如果传入的value本身就是promise对象，那么Promise.resolve将不做任何修改、原封不动地返回这个promise对象。
3. 其他情况，直接返回以该值为成功状态的promise对象。

```js
复制代码Promise.resolve = function (param) {
        if (param instanceof Promise) {
        return param;
    }
    return new Promise((resolve, reject) => {
        if (param && typeof param === 'object' && typeof param.then === 'function') {
            setTimeout(() => {
                param.then(resolve, reject);
            });
        } else {
            resolve(param);
        }
    });
}
```

thenable对象的执行加 setTimeout的原因是根据原生Promise对象执行的结果推断的，如下的测试代码，原生的执行结果为: 20  400  30;为了同样的执行顺序，增加了setTimeout延时。

#### Promise.finally

不管成功还是失败，都会走到finally中,并且finally之后，还可以继续then。并且会将值原封不动的传递给后面的then.

```js
复制代码Promise.prototype.finally = function (callback) {
    return this.then((value) => {
        return Promise.resolve(callback()).then(() => {
            return value;
        });
    }, (err) => {
        return Promise.resolve(callback()).then(() => {
            throw err;
        });
    });
}
```

#### Promise.all

Promise.all(promises) 返回一个promise对象

1. 如果传入的参数是一个空的可迭代对象，那么此promise对象回调完成(resolve),只有此情况，是同步执行的，其它都是异步返回的。
2. 如果传入的参数不包含任何 promise，则返回一个异步完成.
3. promises 中所有的promise都promise都“完成”时或参数中不包含 promise 时回调完成。
4. 如果参数中有一个promise失败，那么Promise.all返回的promise对象失败
5. 在任何情况下，Promise.all 返回的 promise 的完成状态的结果都是一个数组

```js
复制代码Promise.all = function (promises) {
    promises = Array.from(promises);//将可迭代对象转换为数组
    return new Promise((resolve, reject) => {
        let index = 0;
        let result = [];
        if (promises.length === 0) {
            resolve(result);
        } else {
            function processValue(i, data) {
                result[i] = data;
                if (++index === promises.length) {
                    resolve(result);
                }
            }
            for (let i = 0; i < promises.length; i++) {
                  //promises[i] 可能是普通值
                  Promise.resolve(promises[i]).then((data) => {
                    processValue(i, data);
                }, (err) => {
                    reject(err);
                    return;
                });
            }
        }
    });
}
```

- 使用计数器来解决多个异步并发的问题

![image-20231212204429560](README.assets/image-20231212204429560.png)



## 异步嵌套解决方案

```
参考文献
作者：一只ice
链接：https://juejin.cn/post/7144308012952322084
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
```



### Promise.defer

将Promise Promise的resolve Promise的reject提升到同一层级

- **返回Promise使用then连续调用的形式**

  - ```js
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
    
    requestData('iceweb.io').then(res => {
      return requestData(`iceweb.org ${res}`)
    }).then(res => {
      return requestData(`iceweb.com ${res}`)
    }).then(res => {
      console.log(res)
    })
    
    //iceweb.com iceweb.org iceweb.io
    ```

### 生成器 + Promise

- 每次调用**generator.next()**，都会**执行到对应的yield然后停止**

- 像let result = yield requestData(url); 因为是先执行右边的，有结果了再赋值给result

所以第一次执行结束还没有完成赋值，也就是此时result为undefined,且每次next(arg),arg将

被作为上一次yield的结果

```js
function* getData(url) {
  let result = yield requestData(url);
  let result2 = yield requestData(result);
  let result3 = yield requestData(result2);
  console.log(result3);
}
```

```js
// 打印结果是一个对象：{ value: Promise { <pending> }, done: false }
// requestData(url)会返回一个promise,作为value的值
console.log(generator.next()); 
```

```js
// 看着也挺抽象的
generator
    .next()
    .value.then((data) =>
                generator
                .next(`iceweb.org${data}`)
                .value.then((data) =>
                            generator.next(`iceweb.com${data}`).value.then((data) => generator.next(data))
                           )
               );
```

getData已经变为同步的形式，可以拿到最终的结果了。generator虽然一直在调

用.next看起来似乎也产生了回调地狱，其实不用关心这个，因为它这个是有规律的，我们可

以封装成一个自动化执行的函数，内部是如何调用的我们就不用关心了。

### 自动化执行函数封装

```js
function* getData() {
  const res1 = yield requestData('iceweb.io')
  const res2 = yield requestData(`iceweb.org ${res1}`)
  const res3 = yield requestData(`iceweb.com ${res2}`)

  console.log(res3)
}
```

```js
function asyncAutomation(genFn){
  let generator = genFn();

  const _automation = (result) => {
    let nextData = generator.next(result)
    if(nextData.done) return 
    nextData.value.then((data)=>{
      _automation(data)
    })
  }

  _automation()
}

asyncAutomation(getData)
```

- 利用promise+生成器的方式变相实现解决回调地狱问题，其实就是`async await`的一个变种而已
- 最早为 **TJ** 实现，**前端大神人物**
- async await核心代码就类似这些，内部主动帮我们调用`.next`方法



### async + await

**最终解决方案**

```js
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
```

- 哈人，只要把 **自动化执行函数封装** 中的getData生成器函数，改为async函数，yeild的关键

字替换为await就可以实现异步代码同步写法了。

## async/await 剖析

```
参考文献
作者：一只ice
链接：https://juejin.cn/post/7144308012952322084
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
```



- async（异步的）
- async 用于申明一个异步函数

### async内部代码同步执行

- 异步函数的内部代码执行过程和普通的函数是一致的，默认情况下也是会被同步执行

  - ​	

    ```js
    async function sayHi() {
      console.log('hi ice')
    }
    
    sayHi()
    
    //hi ice
    ```

### 异步函数的返回值

异步函数的返回值和普通返回值有所区别

- 普通函数主动返回什么就返回什么，不返回为`undefined`
- 异步函数的返回值特点
  - 明确有返回一个普通值，相当于`Promise.resolve`(返回值)
  - 返回一个thenable对象则由，then方法中的`resolve`,或者`reject`有关
  - 明确返回一个promise，则由这个promise决定

异步函数中可以使用`await`关键字，现在在全局也可以进行`await`，但是不推荐。会阻塞主进程的代码执行

### 异步函数的异常处理

- 如果函数内部中途发生错误，可以通过try catch的方式捕获异常
- 如果函数内部中途发生错误，也可以通过函数的返回值.catch进行捕获

```js
async function sayHi() {
  console.log(res)
}
sayHi().catch(e => console.log(e))

//或者

async function sayHi() {
  try {
    console.log(res)
  }catch(e) {
    console.log(e)
  }
}

sayHi()

//ReferenceError: res is not defined
```

### await 关键字

异步函数中可以使用`await`关键字，普通函数不行

await特点

- 通常await关键字后面都是跟一个Promise
  - 可以是普通值
  - 可以是thenable
  - 可以是Promise主动调用`resolve或者reject`
- 这个promise状态变为fulfilled才会执行`await`后续的代码，所以`await`后面的代码，相当于包括在`.then`方法的回调中，如果状态变为rejected，你则需要在函数内部`try catch`，或者进行链式调用进行`.catch`操作

```js
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

async function getData() {
  const res = await requestData('iceweb.io')
  console.log(res)
}

getData()

// iceweb.io
```

![image-20231213190818377](README.assets/image-20231213190818377.png)

































