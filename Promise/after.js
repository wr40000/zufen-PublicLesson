function after(time, cb){
    console.log(time);
    return function(){
        if(--time == 0){
            cb()
        }
    }
}
let fn = after(3, function(){
    console.log('Terraria');
})
fn();
fn();
fn();