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