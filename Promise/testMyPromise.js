let Promise = require("./promise.js");

let p = new Promise((resolve, reject) => {
  resolve(100);
});
p.then(
  (data) => {
    // return Promise.resolve("Terraria");
    return new Promise("Terraria");
    // return "Terraria";
    // throw new Error("报错了")
  },
  (err) => {
    throw err;
  }
);
console.log("p", p);
// .then((data) => {
//     console.log(data);
//     return data
// }, err => console.log(err));

// setTimeout(() => {
//   console.log("p", p);
// }, 1000);
p.then().then().then()