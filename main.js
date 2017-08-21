Object.size = function (obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
//
let miner = require('miner');
let builder = require('builder');
let upgrader = require('upgrader');
let carrier = require('carrier');

let profiler = require('screeps-profiler');

profiler.enable();

module.exports.loop = function () {
    profiler.wrap(function () {
        main();
    })

}

function main() {
    executeRoles();
    checkSpawns();
    checkDead();
    if(Game.time % 50 == 0) {
        buildStuff();
    }
    //TODO build roads (place over pathfinding?)

    //TODO on the fly reassignment of roles
    //TODO exploration and attacking
    //TODO EFFICIENCY!!
        //TODO better pathfinding
            //TODO prefer closer empty extensions to further
            //TODO find shortest possible path
            //TODO (store paths? pathfinding highway?)
    /*var walls = Game.rooms["E39S28"].find(FIND_STRUCTURES, {
   *     filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART
   * });
   * for (let wall of walls) {
   *     if (wall.hits <= 5) {
    *        Game.rooms["E39S28"].controller.activateSafeMode();
    *    }
    }*/
}

function buildStuff() {
    for (name in Game.spawns) {
        illustrateExtensionPossibilities(Game.spawns[name], Game.spawns[name].room);
    }
    for (room in Game.rooms) {
        buildWalls(Game.rooms[room])
    }
}

function executeRoles() {
    //console.log("EXECUTE ROLES")
    for (let name in Game.creeps) {
        let creep = Game.creeps[name]
        //console.log(creep);
        if (creep.memory.role == "miner") {
            //console.log("MINER")
            miner.run(creep);
        } else if (creep.memory.role == "builder") {
            builder.run(creep);
        } else if (creep.memory.role == "upgrader") {
            upgrader.run(creep);
        }
    }
}

function checkSpawns() {
    for (i in Game.spawns) {
        checkSpawn(Game.spawns[i], Game.spawns[i].room.energyAvailable, Game.spawns[i].room.energyCapacityAvailable);
    }
}

function checkDead() {
    for (creep in Memory.creeps) {
        if (!Game.creeps[creep]) {
            delete Memory.creeps[creep];
            console.log("cleared dead creep " + creep)
        }
    }
}

function checkSpawn(spawn, energy, totalEnergy) {
    console.log(spawn.name + " has " + energy + "/" + totalEnergy)
    if (((energy * 1.25) >= totalEnergy && Object.size(Game.creeps) > 15) || ((energy >= 300) && (Game.time % 10 == 0) && Object.size(Game.creeps) < 15)) {
        //console.log(energy + "  "+ spawn.energyCapacity)
        doSpawn(spawn, energy);
    }
}

function doSpawn(spawn, totalEnergy) {
    if (Object.size(Game.creeps) >= 20) {
        return;
    }
    if (!spawn.spawning) {
        let role = determineRole(spawn);
        let body = maximizeBody(totalEnergy, role);
        let mem = constructMemory(role, spawn.room, spawn)
        //console.log(body)
        //console.log(Object.keys( mem ).map(function ( key ) { return mem[key]; }))
        let creep = spawn.createCreep(body, undefined, mem);
        if (role != "") {
            console.log("creating... name is " + creep)
        } else {
            //console.log("role is empty, aborting creation.")
        }
    } else {
        console.log("already spawning " + spawn.spawning)
    }
}

function determineRole(spawn) {
    let role = "";
    roleList = ["miner", "builder", "upgrader", "carrier"]
    let roles = {};
    for (i in roleList) {
        roles[roleList[i]] = 0;
    }
    for (creep in Game.creeps) {
        if (Game.creeps[creep].memory.role && !roles[Game.creeps[creep].memory.role]) {
            roles[Game.creeps[creep].memory.role] = 0;
        }
        roles[Game.creeps[creep].memory.role]++;
        //console.log(roles[Game.creeps[creep].memory.role])
    }
    role = getMin(roles);
    if (roles["miner"]*2 < Object.size(Game.creeps)) {
        role = "miner";
    } else if(roles["upgrader"] <= 0) {
        role = "upgrader"
    }
    if (role == undefined || role == "undefined") {
        console.log(prevRole + " -- ")
    }
    //do other stuff
    console.log("r " + role)
    return role;
}

function maximizeBody(energy, role) {
    //
    let body = []
    //
    //console.log(energy)
    if (role == "miner") {
        if (energy < (200)) {
            return false;
        }
        energy -= 200;
        body = [WORK, MOVE, CARRY]
        let loopCt = 0;
        while (energy > 0 && loopCt < 10) {
            //console.log(energy)
            if (energy >= 100) {
                body.push(WORK)
                energy -= 100;
            }
            if (energy >= 50) {
                body.push(CARRY)
                energy -= 50;
            }
            if (energy >= 50) {
                body.push(MOVE)
                energy -= 50;
            }
            loopCt++;
        }
        //console.log(body)
    }
    if (role == "carrier") {
        if (energy < (200)) {
            return false;
        }
        energy -= 200;
        body = [CARRY, MOVE, CARRY, MOVE]
        let loopCt = 0;
        while (energy > 0 && loopCt < 10) {
            //console.log(energy)
            if (energy >= 50) {
                body.push(CARRY)
                energy -= 50;
            }
            if (energy >= 50) {
                body.push(MOVE)
                energy -= 50;
            }
            loopCt++;
        }
    }
    if (role == "builder") {
        if (energy < (200)) {
            return false;
        }
        energy -= 200;
        body = [WORK, MOVE, CARRY]
        let loopCt = 0;
        while (energy > 0 && loopCt < 10) {
            //console.log(energy)
            if (energy >= 100) {
                body.push(WORK)
                energy -= 100;
            }
            if (energy >= 50) {
                body.push(MOVE)
                energy -= 50;
            }
            if (energy >= 50) {
                body.push(CARRY)
                energy -= 50;
            }
            loopCt++;
        }
        //console.log(body)
    }
    if (role == "upgrader") {
        if (energy < (200)) {
            return false;
        }
        energy -= 200;
        body = [WORK, MOVE, CARRY]
        let loopCt = 0;
        while (energy > 0 && loopCt < 10) {
            //console.log(energy)
            if (energy >= 50) {
                body.push(CARRY)
                energy -= 50;
            }
            if (energy >= 100) {
                body.push(WORK)
            }
            if (energy >= 50) {
                body.push(MOVE)
                energy -= 50;
            }
            loopCt++;
        }
        //console.log(body)
    }
    return body;
}

function constructMemory(role, room, spawn) {
    let memory = {};
    memory.role = role;
    memory.spawn = spawn;
    if (role == "miner") {
        //memory.role = "miner";
        memory.source = pickSource(room);
        //memory.spawn = spawn;
        //console.log(memory.source);
    }
    if (role == "carrier") {
        //memory.role = "carrier"
        //memory.spawn = spawn;
    }
    if (role == "builder") {
        //memory.role = "builder";
        memory.source = pickSource(room);
        //memory.spawn = spawn;
        memory.building = false;
        //console.log(memory.source);
    }
    if (role == "upgrader") {
        //memory.role = "upgrader";
        //memory.spawn = spawn;
        memory.upgrading = false;
    }
    return memory;
}
Creep.prototype.assignNewSource = function () {
    let newSource = pickSource(this.room)
    this.memory.source = newSource
}

function pickSource(room) {
    let sources = {};
    let s = room.find(FIND_SOURCES)
    for (i of s) {
        sources[i] = 0;
        //console.log(i);
        for (name in Game.creeps) {
            let creep = Game.creeps[name]
            if (creep.memory.source == i) {
                sources[i]++;
            }
        }
        console.log(i + " ++ " + sources[i])
    }
    let arr = Object.keys(sources).map(function (key) {
        return sources[key];
    });
    let min = Math.min.apply(null, arr)
    for (i in sources) {
        if (sources[i] == min) {
            //console.log(sources[i] + " ++ " + min)
            return i;
        }
    }
    return false;
}

function illustrateExtensionPossibilities(spawn, room) {
    let x = spawn.pos["x"]
    let y = spawn.pos["y"]
    checkIllustrate(x, y - 3, room);
    checkIllustrate(x - 3, y - 3, room);
    checkIllustrate(x - 3, y, room);

    checkIllustrate(x, y + 3, room);
    checkIllustrate(x + 3, y + 3, room);
    checkIllustrate(x + 3, y, room);

    checkIllustrate(x + 3, y - 3, room);
    checkIllustrate(x - 3, y + 3, room);
}

function checkIllustrate(x, y, room) {
    let look = new RoomPosition(x, y, room.name).lookFor(LOOK_TERRAIN);
    let lookStructures = new RoomPosition(x, y, room.name).lookFor(LOOK_STRUCTURES);
    let lookSites = new RoomPosition(x, y, room.name).lookFor(LOOK_CONSTRUCTION_SITES);
    let isWall = false;
    for (i in look) {
        if (look[i] == "wall") {
            isWall = true;
        }
    }
    if (lookStructures.length || lookSites.length) {
        isWall = true;
    }

    if (!isWall) {
        room.visual.circle(x, y)
        room.createConstructionSite(x, y, STRUCTURE_EXTENSION)
    }
}

function buildWalls(room) {
    checkWalls(3, undefined, room, 3)
    checkWalls(46, undefined, room, 3)
    checkWalls(undefined, 3, room, 3)
    checkWalls(undefined, 46, room, 3)
}

function checkWalls(x, y, room, offset = 0) {
    let isOccupied = false;
    let isOccupiedSides = false;
    if (x == undefined) {
        for (x = 0 + offset; x < 50 - offset; x++) {
            let lookStructures = new RoomPosition(x, y, room.name).lookFor(LOOK_STRUCTURES);
            let lookSites = new RoomPosition(x, y, room.name).lookFor(LOOK_CONSTRUCTION_SITES);
            let look = new RoomPosition(x, y, room.name).lookFor(LOOK_TERRAIN);
            for (i in look) {
                if (look[i] == "wall") {
                    isOccupied = true;
                } else {
                    isOccupied = false;
                }
            }
            let sideLook1 = new RoomPosition(x, y + 3, room.name).lookFor(LOOK_TERRAIN);
            let sideLook2 = new RoomPosition(x, y - 3, room.name).lookFor(LOOK_TERRAIN);
            for (i in sideLook1) {
                if (sideLook1[i] == "wall") {
                    isOccupiedSides = true;
                } else {
                    for (i in sideLook2) {
                        if (sideLook2[i] == "wall") {
                            isOccupiedSides = true;
                        } else {
                            isOccupiedSides = false;
                        }
                    }
                }
            }
            if (lookStructures.length || lookSites.length) {
                isOccupied = true;
            }
            if (!isOccupied && isOccupiedSides) {
                room.visual.circle(x, y, {
                    stroke: "#ff0000",
                    radius: 0.05
                })
                room.createConstructionSite(x, y, STRUCTURE_WALL)
            } else if (!isOccupied && !isOccupiedSides) {
                room.visual.circle(x, y, {
                    stroke: "#ffff00",
                    radius: 0.1
                })
                room.createConstructionSite(x, y, STRUCTURE_RAMPART)
            }
        }
    } else if (y == undefined) {
        for (y = 0 + offset; y < 50 - offset; y++) {
            let lookStructures = new RoomPosition(x, y, room.name).lookFor(LOOK_STRUCTURES);
            let lookSites = new RoomPosition(x, y, room.name).lookFor(LOOK_CONSTRUCTION_SITES);
            let look = new RoomPosition(x, y, room.name).lookFor(LOOK_TERRAIN);
            for (i in look) {
                if (look[i] == "wall") {
                    isOccupied = true;
                } else {
                    isOccupied = false;
                }
            }
            let sideLook1 = new RoomPosition(x + 3, y, room.name).lookFor(LOOK_TERRAIN);
            let sideLook2 = new RoomPosition(x - 3, y, room.name).lookFor(LOOK_TERRAIN);
            for (i in sideLook1) {
                if (sideLook1[i] == "wall") {
                    isOccupiedSides = true;
                } else {
                    for (i in sideLook2) {
                        if (sideLook2[i] == "wall") {
                            isOccupiedSides = true;
                        } else {
                            isOccupiedSides = false;
                        }
                    }
                }
            }
            if (lookStructures.length || lookSites.length) {
                isOccupied = true;
            }
            if (!isOccupied && isOccupiedSides) {
                room.visual.circle(x, y, {
                    stroke: "#ff0000",
                    radius: 0.05
                })
                room.createConstructionSite(x, y, STRUCTURE_WALL)
            } else if (!isOccupied && !isOccupiedSides) {
                room.visual.circle(x, y, {
                    stroke: "#ffff00",
                    radius: 0.1
                })
                room.createConstructionSite(x, y, STRUCTURE_RAMPART)
            }
        }
    }
}

//


Room.prototype.removeConstructionSites = function () {
    for (x = 0; x < 50; x++) {
        for (y = 0; y < 50; y++) {
            let look = new RoomPosition(x, y, this.name).lookFor(LOOK_CONSTRUCTION_SITES);
            for (i in look) {
                look[i].remove();
            }
        }
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