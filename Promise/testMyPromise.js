let Promise = require("./promise.js");

let p = new Promise((resolve, reject) => {
  resolve();
});
let promise2 = p.then((data) => {
    throw new Error("报错了")
})
promise2.then((data) => {
    console.log(data);
}, err => console.log(err));

