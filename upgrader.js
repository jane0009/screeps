/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('upgrader');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run: function (creep) {
        if (creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
        }
        if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
            creep.memory.upgrading = true;
        }

        //

        if (creep.memory.upgrading) {
            //search for upgradeable structures
            let targets = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => {
                    return (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits < 100000;
                }
            })
            if((targets != "" && targets != {} && targets != [] && targets != undefined) && (creep.room.controller.ticksToDowngrade > 1000)) {
                //console.log("t " + targets)
                let targs = {};
                for(i in targets) {
                    targs[targets[i].id]  = targets[i].hits
                }
                let minHits = getMin(targs);
                //console.log(Game.getObjectById(minHits))
                if(creep.repair(Game.getObjectById(minHits)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(minHits), {
                    visualizePathStyle: {
                        stroke: '#0000ff'
                    }
                });
                }
            }
            else {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.say('up RCL')
                    creep.moveTo(creep.room.controller, {
                        visualizePathStyle: {
                            lineStyle: undefined,
                            stroke: '#ffe100'
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
            for(i in targets) {
                //console.log(targets[i].id)
                targs[targets[i].id] = targets[i].energy;
            }
            let maxEnergy = getMax(targs);
            //console.log(maxEnergy + " -- " + Game.getObjectById(maxEnergy).id)
            if (creep.withdraw(Game.getObjectById(maxEnergy), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(maxEnergy), {
                    visualizePathStyle: {
                        stroke: '#00aaff'
                    }
                });
            }
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