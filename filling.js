module.exports = {
    name: "filling",
    priority: 3,
    bodyBase: [MOVE, CARRY],
    bodyPartOrder: [CARRY, MOVE, CARRY],
    function: function (creep) {
        if (creep.memory.filling && creep.carry.energy == 0) {
            creep.memory.filling = false;
        }
        if (!creep.memory.filling && creep.carry.energy == creep.carryCapacity) {
            creep.memory.filling = true;
        }
        let towers = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (s) => {
                return s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity
            }
        })
        if (!towers.length) {
            delete creep.memory.filling;
            delete creep.memory.task;
            creep.memory.working = false;
        } else {
            if (creep.memory.filling) {
                if (creep.transfer(towers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(towers[0], {
                        visualizePathStyle: {
                            stroke: '#ffaaff'
                        },
                        reusePath: 25
                    })
                }
            } else {
                let targets = creep.room.find(FIND_MY_STRUCTURES, {
                    filter: (s) => {
                        return (s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN);
                    }
                })
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
        }
    },
    condition: function (room) {
        let towers = room.find(FIND_MY_STRUCTURES, {
            filter: (s) => {
                return s.structureType == STRUCTURE_TOWER && s.energy < (s.energyCapacity/2)
            }
        })
        let num = 0;
        for(i in Game.creeps) {
            if(Game.creeps[i].task && Game.creeps[i].memory.task.name == "filling") {
                num++;
            }
        }
        if (num < 1 && towers.length&& room.energyAvailable > 500) return true;
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