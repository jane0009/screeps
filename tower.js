module.exports = {
    run: function (tower) {
        //console.log("tower " + tower.id)
        let hostiles = tower.room.find(FIND_HOSTILE_CREEPS);
        let damaged = tower.room.find(FIND_MY_CREEPS, {
            filter: (c) => {
                return c.hits < c.hitsMax
            }
        })
        if (hostiles.length > 0) {
            tower.attack(hostiles[0]);
        } else if (damaged.length > 0) {
            tower.heal(damaged[0]);
        } else {
            let structure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => {
                    return s.hits < s.hitsMax
                }
            })
            if (structure) {
                tower.repair(structure)
            }
        }
    }
}