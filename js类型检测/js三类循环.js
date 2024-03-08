let arr = new Array(9999999).fill(0);

// console.time('FOR LET~~');
// for (let i = 0; i < arr.length; i++) {}
// console.timeEnd('FOR LET~~');

// console.time('WHILE~~');
// let i = 0;
// while (i < arr.length) {
//     i++;
// }
// console.timeEnd('WHILE~~');

// ************************

// console.time('FOR VAR~~');
// for (var i = 0; i < arr.length; i++) {}
// console.timeEnd('FOR VAR~~');

// console.time('WHILE VAR~~');
// var i = 0;
// while (i < arr.length) {
//     i++;
// }
// console.timeEnd('WHILE VAR~~');

let obj = {
    name: '珠峰培训'
};

for(let key in obj){
    console.log(key);
}