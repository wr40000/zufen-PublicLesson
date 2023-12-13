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

console.log([...obj]); //行不通  需要添加iterator
// console.log(Array.from(obj));
