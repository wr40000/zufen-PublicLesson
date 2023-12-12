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
