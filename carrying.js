module.exports = {
    name: "carrying",
    priority: 2,
    bodyBase: [CARRY, MOVE, WORK],
    bodyPartOrder: [CARRY, MOVE],
    function: function (creep) {
        if (!creep.memory.collecting && creep.carry.energy == 0) {
            creep.memory.collecting = true;
        }
        if (creep.memory.collecting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.collecting = false;
        }

        if (creep.memory.collecting) {
            let res = creep.room.find(FIND_DROPPED_RESOURCES);
            if (res.length) {
                creep.memory.pickup = true;
                if (creep.pickup(res[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(res[0], {
                        visualizePathStyle: {
                            stroke: '#00aaff'
                        },
                        reusePath: 0
                    });
                }
            } else {
                creep.memory.pickup = false;
                if (!creep.memory.awaiting) {
                    let miners = _.filter(Game.creeps, function (creepS) {
                        return creepS.memory.task && creepS.memory.task.name == "mining" && (!creepS.memory.beingAwaited)
                    })
                    let targs = {};
                    for (miner in miners) {
                        targs[miners[miner].id] = miners[miner].carry[RESOURCE_ENERGY];
                        //console.log(miners[miner].carry[RESOURCE_ENERGY]);
                    }
                    let max = getMax(targs);
                    //console.log(max);
                    creep.memory.awaiting = max[0];
                }
                if (!Game.getObjectById(creep.memory.awaiting) || !Game.getObjectById(creep.memory.awaiting).memory.task || !(Game.getObjectById(creep.memory.awaiting).memory.task.name == "mining")) {
                    delete creep.memory.awaiting;
                }
                if (Game.getObjectById(creep.memory.awaiting) && (Game.getObjectById(creep.memory.awaiting).carry[RESOURCE_ENERGY] == 0 || Game.getObjectById(creep.memory.awaiting).mining)) {
                    delete creep.memory.awaiting;
                }
                if (Game.getObjectById(creep.memory.awaiting) && !Game.getObjectById(creep.memory.awaiting).memory.canTransfer) {
                    creep.moveTo(Game.getObjectById(creep.memory.awaiting), {
                        visualizePathStyle: {
                            stroke: '#00aaff'
                        },
                        reusePath: 0
                    });
                }
            }
        } else {
            //console.log("NOT COLLECTING")
            delete creep.memory.awaiting;
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION) &&
                        structure.energy < structure.energyCapacity;
                }
            });
            //console.log(targets.length)
            if (targets.length > 0) {
                //console.log("len" +targets.length)
                let targs = {};
                for (targ in targets) {
                    if(!Game.getObjectById(targets[targ].id)) return;
                        targs[targets[targ].id] = targets[targ].energy
                }
                //console.log("targs"+targs)
                let min = getMin(targs);
                let minObjs = [];
                for (i in min) {
                    minObjs.push(Game.getObjectById(min[i]))
                }
                //console.log(minObjs)
                let closest = _.sortBy(minObjs, s => creep.pos.getRangeTo(s))
                //console.log(closest)
                if (creep.transfer(closest[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closest[0], {
                        visualizePathStyle: {
                            stroke: '#ffffff'
                        },
                        reusePath: 0
                    });
                }
            } else {
                let spawners = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => {
                        return (s.structureType == STRUCTURE_SPAWN)
                    }
                });
                if (creep.transfer(spawners[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawners[0], {
                        visualizePathStyle: {
                            stroke: '#ffaaff'
                        },
                        reusePath: 0
                    })
                }
            }
        }




        let miners = _.filter(Game.creeps, function (creep) {
            return creep.memory.task && creep.memory.task.name == "mining"
        })
        let num = miners.length / 1.5
        let carriers = _.filter(Game.creeps, function (creep) {
            return creep.memory.task && creep.memory.task.name == "carrying"
        })
        if (carriers.length > num && !creep.awaiting) {
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
        let miners = _.filter(Game.creeps, function (creep) {
            return creep.memory.task && creep.memory.task.name == "mining"
        })
        let num = miners.length / 1.5
        let carriers = _.filter(Game.creeps, function (creep) {
            return creep.memory.task && creep.memory.task.name == "carrying"
        })
        if (carriers.length < num) return true;
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

function getMin(obj) {
    let minArr = [];
    let arr = Object.keys(obj).map(function (key) {
        return obj[key];
    });
    let min = Math.min.apply(null, arr)
    for (i in obj) {
        if (obj[i] == min) {
            //console.log(sources[i] + " ++ " + min)
            //console.log(i);
            minArr.push(i);
        }
    }
    //console.log(minArr);
    return minArr;
}