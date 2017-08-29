module.exports = {
    name: "defending",
    priority: 1,
    bodyBase: [TOUGH, TOUGH, MOVE, ATTACK],
    bodyPartOrder: [TOUGH, MOVE, ATTACK, RANGED_ATTACK],
    function: function (creep) {
        let hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        //TODO get some better code dammit
        if (hostiles.length) {
            if (creep.attack(hostiles[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(hostiles[0], {
                    visualizePathStyle: {
                        stroke: '#ffaaff'
                    },
                    reusePath: 25
                })
            }
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
    },
    condition: function (room) {
        let hostiles = room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length) return true;
        let defenders = _.filter(Game.creeps, function (creep) {
            return creep.memory.task && creep.memory.task.name == "defending"
        })
        if (defenders.length < room.controller.level) return true;
        return false;
    }
}