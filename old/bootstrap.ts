
const run = (creep: Creep) => {
  console.log(`running for ${creep.name}`);
  let spawn = Game.spawns[Object.keys(Game.spawns)[0]];
  let room = spawn.room;

  if (creep.store.energy == 0) {
    creep.memory.working = false;
    console.log("not working")
  }
  else if (creep.store.energy == creep.store.getCapacity("energy")) {
    creep.memory.working = true;
    console.log("working")
  }

  if (!creep.memory.working) {
    let sources = room.find(FIND_SOURCES, {
      filter: (source) => {
        return source.energy > 0;
      }
    });
    console.log(sources[0])
    let t = creep.harvest(sources[0]);
    console.log(`t: ${t}`)
    if (t != 0) {
      let res = creep.moveTo(sources[0].pos);
      console.log(`res: ${res}`)
    }
  }
  else {
    if (spawn.store.energy < spawn.store.getCapacity("energy")) {
      if (creep.transfer(spawn, RESOURCE_ENERGY) != 0) {
        creep.moveTo(spawn.pos);
      }
    }
    else {
      let controller = spawn.room.controller;
      if (!controller) return;
      if (creep.upgradeController(controller) != 0) {
        creep.moveTo(controller);
      }
    }
  }
}

export const boostrap = (spawn: StructureSpawn) => {
  console.log("bootstrapping...");
  if (Object.keys(Game.creeps).length < 2) {
    if (Memory.id == undefined) Memory.id = 0;
    if (spawn.store.energy > 250) {
      spawn.spawnCreep([WORK, MOVE, CARRY], `${++Memory.id}`, {
        memory: {
          bootstrap: true,
          working: false,
          assigned: false,
          targets: {}
        }
      });
    }
  }
  for (const creep in Game.creeps) {
    run(Game.creeps[creep]);
  }
  if (!spawn.room.controller?.safeMode && spawn.room.controller?.safeModeAvailable) {
    spawn.room.controller.activateSafeMode();
  }
}
