module.exports = {
    name: "mining",
    priority: 0,
    bodyBase: [WORK, CARRY, MOVE],
    bodyPartOrder: [WORK, MOVE, CARRY, CARRY],
    function: function (creep) {
        //console.log("mining " + creep.name)
        if (!creep.memory.source) {
            console.log(creep.name + " has no source")
            let searchSource = creep.room.find(FIND_SOURCES_ACTIVE);
            let targs = {};
            for (i in searchSource) {
                targs[searchSource[i].id] = 0;
            }
            for (i in Game.creeps) {
                if (Game.creeps[i].memory.source && Game.creeps[i].memory.task && Game.creeps[i].memory.task.name == "mining") {
                    //console.log(Game.creeps[i].memory.source)
                    targs[Game.creeps[i].memory.source]++;
                }
            }
            let min = getMin(targs);
            //console.log(Object.size(targs));
            let minObjs = [];
            for (i in min) {
                minObjs.push(Game.getObjectById(min[i]))
            }
            //console.log(minObjs)
            let closest = _.sortBy(minObjs, s => creep.pos.getRangeTo(s))
            //console.log(closest)
            creep.memory.source = closest[0].id
        }
        if (!creep.memory.mining && creep.carry.energy == 0) {
            creep.memory.mining = true;
        }
        if (creep.memory.mining && creep.carry.energy == creep.carryCapacity) {
            creep.memory.mining = false;
        }
        if (creep.memory.mining) {
            let dropped = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (r) => {
                    return r.type = RESOURCE_ENERGY
                }
            })
            if (Object.size(dropped)) {
                //console.log(dropped)
                if (creep.pickup(dropped[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropped[0], {
                        visualizePathStyle: {
                            stroke: '#ffaaff'
                        },
                        reusePath: 25
                    });
                }
            } else {
                let source = creep.memory.source;
                var sources = creep.room.find(FIND_SOURCES, {
                    filter: (s) => {
                        return s.id == source
                    }
                });
                if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0], {
                        visualizePathStyle: {
                            stroke: '#ffaa00'
                        },
                        reusePath: 25
                    });
                }
            }
        } else {
            let carriers = _.filter(Game.creeps, function(creep) {
            return creep.memory.task && creep.memory.task.name == "carrying"
        })
        let isntWorking = false;
        for(carry in carriers) {
            if(carriers[carry].memory.pickup == false) {
                isntWorking = true;
            }
        }
        if(carriers.length > 0 && isntWorking) {
            for(carrier in carriers) {
                if(carriers[carrier].memory.awaiting && carriers[carrier].memory.awaiting == creep.id) {
                if(creep.transfer(carriers[carrier], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.memory.canTransfer = false;
                    creep.memory.beingAwaited = true;
                }
                else {
                    creep.memory.canTransfer = true;
                    creep.memory.beingAwaited = true;
                }
            }
            else {
                delete creep.memory.canTransfer;
                creep.memory.beingAwaited = false;
            }
            }
        } else {
            delete creep.memory.canTransfer;
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION) &&
                        structure.energy < structure.energyCapacity;
                }
            });
            if (targets.length > 0 && (targets[0].energy < targets[0].energyCapacity)) {
                let targs = {};
                for (targ in targets) {
                    targs[targets[targ].id] = targets[targ].energy
                }
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
                        reusePath: 25
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
                        reusePath: 25
                    })
                }
            }
        }
        }
        if ((creep.room.energyAvailable >= creep.room.energyCapacityAvailable)) {
            //console.log(creep.room.energyAvailable)
            delete creep.memory.canTransfer;
            delete creep.memory.task;
            delete creep.memory.mining;
            delete creep.memory.beingAwaited;
            creep.memory.working = false;
        }
    },
    condition: function (room) {
        let num = 0;
        for (creep in Game.creeps) {
            if (Game.creeps[creep].memory.task && Game.creeps[creep].memory.task.name == "mining") num++;
        }
        let spaces = findSpaces(room);
        //console.log(spaces);
        let percent = Math.ceil(Object.size(Game.creeps) * .3);
        if ((num < spaces-1) && room.energyAvailable < room.energyCapacityAvailable) {
            //console.log(room.energyAvailable + "/" + room.energyCapacityAvailable + ", adding mining task");
            return true;
        }
        return false;
    }
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
Object.size = function (obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
function findSpaces(room) {
    let sources = room.find(FIND_SOURCES_ACTIVE);
    let num = 0;
    for(i in sources) {
        let pos = sources[i].pos;
        for(i = pos.x-1; i <= pos.x+1; i++) {
            for(j = pos.y-1; j <= pos.y+1; j++) {
                let look = new RoomPosition(i,j,room.name).lookFor(LOOK_TERRAIN);
                if(look[0] !== "wall") num++;
        }
        }
    }
    return num;
}