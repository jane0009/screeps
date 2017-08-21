Object.size = function (obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
module.exports = {
    run: function (creep) {
        if (creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        if (creep.memory.building) {
            var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
            let targs = {};
            for (name in Game.creeps) {
                if (Game.creeps[name].memory.target) {
                    if (targs[Game.creeps[name].memory.target]) {
                        targs[Game.creeps[name].memory.target]++;

                        let builders = _.filter(Game.creeps, (creep) => creep.memory.role == "builder");
                        if (targs[Game.creeps[name].memory.target] > Math.ceil(Object.size(targs) / Object.size(builders))) {
                            console.log(Game.creeps[name].memory.target + "--" + targs[Game.creeps[name].memory.target])
                            console.log(Math.ceil(Object.size(targs) / Object.size(builders)))
                            delete creep.memory.target;
                        }
                    } else {
                        targs[Game.creeps[name].memory.target] = 1;
                    }
                }
            }
            let target = getMin(targs);
            if (!target) target = targets[0];
            //console.log(Object.size(target))
            if (creep.memory.target == undefined || creep.memory.target == {}) {
                console.log("cm")
                creep.memory.target = target
            }

            newTargets = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {
                filter: (t) => {
                    return t.id == creep.memory.target.id
                }
            });
            //console.log(newTargets);
            if (Object.size(newTargets) > 0) {
                if (creep.build(newTargets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(newTargets[0], {
                        visualizePathStyle: {
                            stroke: '#ffffff'
                        }
                    });
                }
            } else {
                console.log("no targets")
                delete creep.memory.target;
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.say('up RCL')
                    creep.moveTo(creep.room.controller, {
                        visualizePathStyle: {
                            stroke: '#ff0000'
                        }
                    });
                }
            }
        } else {
            //retrieve energy
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
            if ((Game.getObjectById(maxEnergy).energy * 2) > Game.getObjectById(maxEnergy).energyCapacity) {
                //console.log(maxEnergy + " -- " + Game.getObjectById(maxEnergy).id)
                if (creep.withdraw(Game.getObjectById(maxEnergy), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(maxEnergy), {
                        visualizePathStyle: {
                            stroke: '#00aaff'
                        }
                    });
                }
            } else {
                var source = creep.memory.source;
                //console.log(source)
                var sources = creep.room.find(FIND_SOURCES, {
                    filter: (s) => {
                        return s == source
                    }
                });
                if (!sources.length) {
                    sources = creep.room.find(FIND_SOURCES)
                }
                if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0], {
                        visualizePathStyle: {
                            stroke: '#ffaa00'
                        }
                    });
                }
            }

            //


        }
    }
};

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