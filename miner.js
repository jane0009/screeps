Object.size = function (obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('miner');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run: function (creep) {
        //console.log("RUN MINER")
        if (creep.carry.energy < creep.carryCapacity) {

            var source = creep.memory.source;
            //console.log(source)
            var sources = creep.room.find(FIND_SOURCES, {
                filter: (s) => {
                    return s == source
                }
            });
            //console.log(sources)
            if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                //console.log("not in range")
                creep.moveTo(sources[0], {
                    visualizePathStyle: {
                        stroke: '#ffaa00'
                    }
                });
                //creep.room.createConstructionSite(creep.pos,STRUCTURE_ROAD);
            }
        } else {
            let carriers = _.filter(Game.creeps, (creep) => creep.memory.role == "carrier");
            if(Object.size(carriers) > 0) {
                creep.drop(RESOURCE_ENERGY);
            }
            else {

            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION) &&
                        structure.energy < structure.energyCapacity;
                }
            });
            if (targets.length > 0 && (targets[0].energy < targets[0].energyCapacity)) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {
                        visualizePathStyle: {
                            stroke: '#ffffff'
                        }
                    });
                }
            } else {
                let spawn = creep.memory.spawn
                let spawners = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => {
                        return (s == spawn && s.structureType == STRUCTURE_SPAWN)
                    }
                });
                if(spawners == {} || spawners == [] || spawners == "") {
                    spawners =creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => {
                        return (s.structureType == STRUCTURE_SPAWN)
                    }
                });
                }
                console.log("RETURN " + spawners)
                if (creep.transfer(spawners[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawners[0], {
                    visualizePathStyle: {
                        stroke: '#ffaaff'
                    }
                })
                }
            }
        }
        }
    }
};