let possibleTasks = {};
possibleTasks.mining = require('mining');
possibleTasks.upgrading = require('upgrading');
possibleTasks.building = require('building');
possibleTasks.filling = require('filling');
possibleTasks.carrying = require('carrying');
let tasks = [];

let towerCode = require('tower')

let profiler = require('screeps-profiler');
profiler.enable();


module.exports.loop = function () {
    profiler.wrap(function () {
        checkDeadCreeps();
        checkTasks();
        runCurrentlyAssignedTasks();
        determineNewTasks();
        runTowers();
    })
}

function checkDeadCreeps() {
    for (creep in Memory.creeps) {
        if (!Game.creeps[creep]) {
            delete Memory.creeps[creep];
            console.log("cleared dead creep " + creep)
        }
    }
}

function runTowers() {
    for (room in Game.rooms) {
        let curRoom = Game.rooms[room];
        let towers = curRoom.find(FIND_MY_STRUCTURES, {
            filter: (s) => {
                return s.structureType == STRUCTURE_TOWER
            }
        })
        for (tower in towers) {
            towerCode.run(towers[tower]);
        }
    }
}

function determineNewTasks() {
    for (task in possibleTasks) {
        for (spawn in Game.spawns) {
            //console.log(possibleTasks[task].name + " " + possibleTasks[task].priority + " " + Game.spawns[spawn].room.controller.level)
            if (possibleTasks[task].condition(Game.spawns[spawn].room) && (possibleTasks[task].priority < Game.spawns[spawn].room.controller.level)) {
                //console.log("condition succeded");
                tasks.push(possibleTasks[task]);
                //console.log(task + " -- " + possibleTasks[task]);
                //console.log(tasks)
            }
        }
    }
}

function runCurrentlyAssignedTasks() {
    for (i in Game.creeps) {
        if (Game.creeps[i].memory.working == true) {
            possibleTasks[Game.creeps[i].memory.task.name].function(Game.creeps[i]);
        }
    }
}

function checkTasks() {
    if (tasks != [] && tasks != {} && tasks != "" && task != undefined) {
        let tasksName = [];
        for (i in tasks) {
            tasksName.push(tasks[i].name)
        }
        tasks.sort(sortTasks)
        //console.log("tasks: " + tasksName);
        for (i in tasks) {
            if (tasks[i].name) {
                //console.log(tasks[i].name)
                assignTask(tasks[i]);
                tasks.splice(i, 1);
            }
            //console.log("del" + tasks)
        }
    }
}

function assignTask(task) {
    if (!task.name) return;
    let prevCreeps = [];
    for (i in Game.creeps) {
        if (!Game.creeps[i].memory.working) {
            //console.log("pref " + Game.creeps[i].memory.preferredTask + " act " + task.name);
            if (Game.creeps[i].memory.preferredTask == task.name) {
                Game.creeps[i].memory.working = true;
                Game.creeps[i].memory.task = task;
                return;
            }
        }
    }
    for (name in Game.creeps) {
        if (!Game.creeps[name]) return;
        let testCreep = Game.creeps[name]
        let test = appraiseBody(task, testCreep);
        //console.log(test + " == " + Game.creeps[name].memory.working )
        if (Game.creeps[name] && Game.creeps[name].memory && test && !Game.creeps[name].memory.working) {
            //console.log()
            //console.log(test)
            //console.log("pref " + Game.creeps[name].memory.preferredTask + " act " + task.name);
            Game.creeps[name].memory.working = true;
            Game.creeps[name].memory.task = task;
            return;
        }
    }
    console.log(task.name + " failed")
    for (i in Game.spawns) {
        let spawner = Game.spawns[i];
        //console.log(Game.spawns[i].spawning)
        if (!spawner.spawning) {
            spawnNewWorker(task, spawner, spawner.room);
            return;
        }
    }
}

function spawnNewWorker(task, spawner, room) {
    let mem = getMemory(task);
    let body = getBody(task, room.energyAvailable);
    //console.log("b " + body);
    spawner.createCreep(body, undefined, mem);
}

function getMemory(task) {
    let memory = {};
    memory.preferredTask = task.name;
    memory.task = task;
    memory.working = true;
    return memory;
}

function getBody(task, energy) {
    let body = [];
    body = task.bodyBase;
    for (i in task.bodyBase) {
        if (energy >= BODYPART_COST[task.bodyBase[i]]) {
            energy -= BODYPART_COST[task.bodyBase[i]]
            //console.log(energy)
        } else {
            //console.log("e " + energy + "  -  " + BODYPART_COST[task.bodyBase[i]])
            //console.log("NOT ENOUGH ENERGY");
            return ERR_NOT_ENOUGH_ENERGY
        }
    }
    let loop = 0;
    while (energy > 1 && loop < 10) {
        for (i in task.bodyPartOrder) {
            if (energy >= BODYPART_COST[task.bodyPartOrder[i]]) {
                energy -= BODYPART_COST[task.bodyPartOrder[i]]
                body.push(task.bodyPartOrder[i]);
                //console.log(body)
                //console.log(energy)
            } else {
                //console.log("NOT ENOUGH ENERGY FOR " + task.bodyPartOrder[i])
            }
        }
        loop++;
    }
    //console.log(energy)
    return body;
}

function sortTasks(a, b) {
    //console.log("a " + a.priority + " b " + b.priority)
    if (a.priority < b.priority)
        return -1;
    if (a.priority > b.priority)
        return 1;
    return 0;
}

function appraiseBody(task, creep) {
    let body = creep.body;
    let testBody = task.bodyBase;
    let targs = {};
    for (i in testBody) {
        targs[testBody[i]] = false;
        for (j in body) {
            if (body[j].type == testBody[i]) {
                targs[testBody[i]] = true;
            }
        }
        if (!targs[testBody[i]]) {
            //console.log(targs[testBody[i]] + " + " + testBody[i])
            return false;
        }
    }
    return true;
}

//extend
if (!Creep.prototype._moveTo) {
    Creep.prototype._moveTo = Creep.prototype.moveTo
}