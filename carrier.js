module.exports = {
    run: function(creep) {
        if (creep.carry.energy < creep.carryCapacity) {

            var source = creep.memory.source;
            //console.log(source)
            var sources = creep.room.find(FIND_DROPPED_ENERGY, {
                filter: (s) => {
                    return s == source
                }
            });
            //console.log(sources)
            if (creep.pickup(sources[0]) == ERR_NOT_IN_RANGE) {
                //console.log("not in range")
                creep.moveTo(sources[0], {
                    visualizePathStyle: {
                        stroke: '#ff00aa'
                    }
                });
                //creep.room.createConstructionSite(creep.pos,STRUCTURE_ROAD);
            }
        } else {
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
                        if (s == spawn && s.structureType == STRUCTURE_SPAWN) {
                            return s
                        }
                    }
                });
                //console.log(spawners)
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