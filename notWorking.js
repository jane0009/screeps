module.exports = {
    function: function (creep) {
        let builders = _.filter(Game.creeps, function (creep) {
            return creep.memory.task && creep.memory.task.name == "building"
        })
        if (creep.carry.energy > 0) {
            if (_.size(creep.room.find(FIND_CONSTRUCTION_SITES)) && !_.size(builders) && creep.room.controller.ticksToDowngrade > 5000) {
                require('building').function(creep);
            } else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION) &&
                            structure.energy < structure.energyCapacity;
                    }
                });
                if (targets.length > 0 && (targets[0].energy < targets[0].energyCapacity)) {
                    //console.log(minObjs)
                    let closest = _.sortBy(targets, s => creep.pos.getRangeTo(s))
                    //console.log(closest)
                    if (creep.transfer(closest[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closest[0], {
                            visualizePathStyle: {
                                stroke: '#ffffff'
                            },
                            reusePath: 50
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
                            reusePath: 50
                        })
                    }
                }
            }
        } else {
            if (_.size(creep.room.find(FIND_CONSTRUCTION_SITES)) && !_.size(builders) && creep.room.controller.ticksToDowngrade > 5000) {
                require('building').function(creep);
            } else {
                if (Game.flags["Recall"]) {
                    let pos = Game.flags["Recall"].pos;
                    let isNear = false;
                    let range = _.size(Game.creeps) / 8;
                    for (let x = pos.x - range; x < pos.x + range; x++) {
                        for (let y = pos.y - range; y < pos.y + range; y++) {
                            if (creep.pos == new RoomPosition(x, y, creep.room.name)) {
                                isNear = true;
                            }
                        }
                    }
                    let nearRange = range / 2;
                    if (!isNear) {
                        creep.moveTo(Game.flags["Recall"], {
                            reusePath: 50,
                            range: nearRange
                        });
                    }
                }
            }
        }
    }
}