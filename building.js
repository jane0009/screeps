module.exports = {
    name: "building",
    priority: 2,
    bodyBase: [WORK, MOVE, CARRY],
    bodyPartOrder: [WORK, CARRY, MOVE],
    function: function (creep) {
        let sites = creep.room.find(FIND_CONSTRUCTION_SITES)
        let structs = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return (s.structureType == STRUCTURE_ROAD && s.hits < s.hitsMax) || (s.hits < s.hitsMax && s.hits < 5000)
            }
        })
        if (Object.size(sites)) {
            if (!creep.memory.construct) {
                let targs = {};
                for (i in sites) {
                    targs[sites[i].id] = sites[i].progress
                }
                let max = getMax(targs);
                creep.memory.construct = max;
            }
            if (Game.getObjectById(creep.memory.construct)) {
                if (creep.carry.energy > 0) {
                    creep.say("building...");
                    if (creep.build(Game.getObjectById(creep.memory.construct)) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.construct), {
                            visualizePathStyle: {
                                stroke: '#00aa00'
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
                    //console.log(targets)
                    let targs = {};
                    for (i in targets) {
                        //console.log(targets[i].id)
                        targs[targets[i].id] = targets[i].energy;
                    }
                    let maxEnergy = getMax(targs);
                    //console.log(maxEnergy + " -- " + Game.getObjectById(maxEnergy).id)
                    if (creep.withdraw(Game.getObjectById(maxEnergy), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(maxEnergy), {
                            visualizePathStyle: {
                                stroke: '#00aaff'
                            },
                            reusePath: 25
                        });
                    }
                }
            } else {
                creep.memory.construct = undefined;
            }
        } else if (_.size(structs)) {
            if (creep.repair(structs[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(structs[0], {
                    visualizePathStyle: {
                        stroke: '#00aaff'
                    },
                    reusePath: 50
                });
            }
        } else {
            //creep.memory.construct = undefined;
            delete creep.memory.task;
            creep.memory.working = false;
            for (m in creep.memory) {
                if (!(m == "working") && !(m == "preferredTask")) {
                    //console.log("DELETE.." + m);
                    delete creep.memory[m];
                }
            }
        }
        if (Object.size(Game.creeps) < 2 || creep.room.energyAvailable < 200) {
            //creep.memory.construct = undefined;
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
        let sites = room.find(FIND_CONSTRUCTION_SITES);
        //console.log(sites);
        let num = 0;
        for (i in Game.creeps) {
            if (Game.creeps[i].memory.task && Game.creeps[i].memory.task.name == "building") {
                num++;
            }
        }
        if (num < (Object.size(sites) / 2)) {
            //console.log(num + " -- " + Object.size(sites))
            //console.log("true")
            return true;
        }
        return false;
    }
}

function getMin(obj) {
    let arr = Object.keys(obj).map(function (key) {
        return obj[key];
    });
    let min = Math.min.apply(null, arr)
    for (i in obj) {
        if (obj[i] == min) {
            //console.log(sources[i] + " ++ " + min)
            return i;
        }
    }
}

function getMax(obj) {
    let arr = Object.keys(obj).map(function (key) {
        return obj[key];
    });
    let max = Math.max.apply(null, arr)
    for (i in obj) {
        if (obj[i] == max) {
            //console.log(sources[i] + " ++ " + min)
            return i;
        }
    }
}
Object.size = function (obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};