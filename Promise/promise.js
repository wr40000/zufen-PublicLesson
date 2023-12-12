let PENDING = "PENDING";
let RESOLVE = "RESOLVE";
let REJECT = "REJECT";

const resolvePromise = (promise2, x, resolve, reject) => {
  console.log("promise2: ", promise2);
};

class Promise {
  constructor(executor) {
    this.state = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    let resolve = (value) => {
      if ((this.state = PENDING)) {
        this.state = RESOLVE;
        this.value = value;
        this.onResolvedCallbacks.forEach((cb) => cb());
      }
    };
    let reject = (reason) => {
      if ((this.state = PENDING)) {
        this.state = REJECT;
        this.reason = reason;
        this.onRejectedCallbacks.forEach((cb) => cb());
      }
    };
    try {
      executor(resolve, reject);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  }
  then(onfulfilled, onrejected) {
    var promise2 = new Promise((resolve, reject) => {
      if (this.state == RESOLVE) {
        setTimeout(() => {
          try {
            let x = onfulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            console.log(e);
            reject(e);
          }
        }, 0);
      }
      if (this.state == REJECT) {
        setTimeout(() => {
          try {
            let x = onrejected(this.value);
            reject(x);
          } catch (e) {
            reject(e);
          }
        }, 0);
      }
      if (this.state == PENDING) {
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onfulfilled(this.value);
              resolve(x);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onrejected(this.value);
              reject(x);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });
    return promise2
  }
}

module.exports = Promise;
