module.exports = {
    name: "upgrading",
    priority: 1,
    bodyBase: [WORK, CARRY, MOVE],
    bodyPartOrder: [WORK, MOVE, CARRY],
    function: function (creep) {
        //console.log("ran upgrading function " + creep.name);
        if (creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
        }
        if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
        }
        if (creep.memory.upgrading) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.say('praise GCL')
                creep.moveTo(creep.room.controller, {
                    visualizePathStyle: {
                        lineStyle: undefined,
                        stroke: '#ffe100'
                    },
                    reusePath: 25
                });
            }
        } else {
            let targets = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (s) => {
                    return (s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN);
                }
            })
            //console.log(targets)
            let targs = {};
            for (i in targets) {
                //console.log(targets[i].id)
                targs[targets[i].id] = targets[i].energy;
            }
            let maxEnergy = getMax(targs);
            let maxObjs = [];
            for (i in maxEnergy) {
                maxObjs.push(Game.getObjectById(maxEnergy[i]))
            }
            //console.log(minObjs)
            let closest = _.sortBy(maxObjs, s => creep.pos.getRangeTo(s))
            //console.log(maxEnergy + " -- " + Game.getObjectById(maxEnergy).id)
            if (creep.withdraw(closest[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closest[0], {
                    visualizePathStyle: {
                        stroke: '#00aaff'
                    },
                    reusePath: 25
                });
            }
        }
        if (creep.room.controller.level >= 8 || (Game.time % 100 == 0 && creep.carry.energy == 0)) {
            delete creep.memory.task;
            delete creep.memory.upgrading;
            creep.memory.working = false;
        }
    },
    condition: function (room) {
        //console.log("test condition")
        if (room.controller.ticksToDowngrade < 3000) {
            //console.log("downgrade less");
            return true;
        }
        if (room.controller.level == 8) {
            return false;
        }
        let num = 0;
        for (creep in Game.creeps) {
            if (Game.creeps[creep].memory.task && Game.creeps[creep].memory.task.name == "upgrading") num++;
        }
        if(num > room.controller.level) return false;
        let percent = Math.ceil(Object.size(Game.creeps) * .4);
        if (num < percent && Game.time % 25 == 0) {
            //console.log("num less");
            return true;
        }
        return false;
    }
}

function getMax(obj) {
    let maxArr = [];
    let arr = Object.keys(obj).map(function (key) {
        return obj[key];
    });
    let max = Math.max.apply(null, arr)
    for (i in obj) {
        if (obj[i] == max) {
            maxArr.push(i);
        }
    }
    return maxArr;
}
Object.size = function (obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};