module.exports = {
    name: "upgrading",
    priority: 1,
    bodyBase: [WORK, CARRY, MOVE],
    bodyPartOrder: [WORK, MOVE, CARRY],
    function: function (creep) {
        //console.log("ran upgrading function " + creep.name);
        if(Memory.deferUpgrade && creep.room.controller.ticksToDowngrade < 5000) {
            delete Memory.deferUpgrade;
        }
        if (creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
        }
        if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
        }
        let builders = _.filter(Game.creeps, function (creep) {
            return creep.memory.task && creep.memory.task.name == "building"
        })
        if (_.size(creep.room.find(FIND_CONSTRUCTION_SITES)) && !_.size(builders) && creep.room.controller.ticksToDowngrade > 5000) {
            require('building').function(creep);
        }
        if (creep.memory.upgrading) {
            if(Memory.deferUpgrade) {
                creep.memory.upgrading = false;
                return;
            }
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
        let upgraders = _.filter(Game.creeps, function (creep) {
            return creep.memory.task && creep.memory.task.name == "upgrading"
        })
        if (_.size(upgraders) > findSpacesController(creep.room.controller)) {
            delete creep.memory.task;
            creep.memory.working = false;
            for (m in creep.memory) {
                if (!(m == "working") && !(m == "preferredTask")) {
                    //console.log("DELETE.." + m);
                    delete creep.memory[m];
                }
            }
        }
    },
    condition: function (room) {
        //console.log("test condition")
        if (room.controller.ticksToDowngrade < 3000) {
            //console.log("downgrade less");
            return true;
        }
        if (room.controller.level == 8 && !Game.time % 15 == 0) {
            return false;
        }
        let num = 0;
        for (creep in Game.creeps) {
            if (Game.creeps[creep].memory.task && Game.creeps[creep].memory.task.name == "upgrading") num++;
        }
        //if(num > room.controller.level) return false;
        let spaces = findSpacesController(room.controller);
        if (num < 1) return true;
        if (num < spaces && Game.time % 25 == 0) {
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

function findSpacesController(source) {
    let num = 0;
    if (!source || !source.pos) return 0;
    let pos = source.pos;
    for (i = pos.x - 2; i <= pos.x + 2; i++) {
        for (j = pos.y - 2; j <= pos.y + 2; j++) {
            let look = new RoomPosition(i, j, source.room.name).lookFor(LOOK_TERRAIN);
            if (look[0] !== "wall") num++;
        }
    }
    //console.log(num);
    return num / 2;
}