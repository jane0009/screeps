/* eslint-disable snakecasejs/snakecasejs */
/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// WolfWings 6 February 2018 at 04:20

// Use a Red/White flag as a 'rally point' when there's nothing to do in a room.
// Use a Yellow/Yellow flag to mark an exit row that leads TO a room to remote-mine.
// Use a Yellow/Grey flag to mark an exit leading back FROM a room to where more storage is.
// REMEMBER TO BUILD ROADS AND EXTENSIONS! This is not an automated AI, you control construction!

declare global {
  interface CreepMemory {
    full?: boolean;
    room?: string;
  }
}

/**
 * stub
 *
 * @param {OwnedStructure} object stub
 * @returns {boolean} stub
 */
const repair_filter = (object: OwnedStructure) =>
  object.my !== false &&
  object.structureType !== STRUCTURE_WALL &&
  object.structureType !== STRUCTURE_RAMPART &&
  object.hits < object.hitsMax &&
  object.hits < object.hitsMax - 500;

/**
 * stub
 */
export const loop = (): void => {
  if (Game.time % 100 === 0) {
    for (const name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
      }
    }
  }

  const creeps: {
    [room_name: string]: Creep[];
  } = {};
  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    if (!creep.my) {
      continue;
    }
    const room = creep.room.name;
    creeps[room] = creeps[room] || [];
    creeps[room].push(creep);
  }

  for (const room_index in Game.rooms) {
    const room = Game.rooms[room_index];
    let spawns;
    if (creeps[room_index] && creeps[room_index].length > 0) {
      creeps[room_index].sort((a, b) => (a.ticksToLive || 0) - (b.ticksToLive || 0));
    }
    const my_structures = room.find(FIND_MY_STRUCTURES);
    const towers = _.filter(my_structures, (object) => object.structureType === STRUCTURE_TOWER);
    let tanks;
    let repair;
    let hostile_creeps;
    let wounded_creeps;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const tower of towers) {
      do {
        hostile_creeps = hostile_creeps || room.find(FIND_HOSTILE_CREEPS);
        if (hostile_creeps.length > 0) {
          // tower.attack(tower.pos.findClosestByRange(hostile_creeps));
          break;
        }

        wounded_creeps = wounded_creeps || _.filter(creeps[room_index], (object) => object.hits < object.hitsMax);
        if (wounded_creeps.length > 0) {
          // tower.heal(tower.pos.findClosestByRange(wounded_creeps));
          break;
        }
      } while (false);
    }

    do {
      let body = null;
      creeps[room_index] = creeps[room_index] || [];
      if (creeps[room_index].length < 3 && room.energyAvailable >= 250) {
        body = [WORK, CARRY, MOVE, MOVE];
      } else if (creeps[room_index].length < 5 && room.energyAvailable === room.energyCapacityAvailable) {
        body = [WORK, WORK, CARRY, MOVE];
        if (room.energyAvailable >= 1300) {
          body = [
            WORK,
            WORK,
            WORK,
            WORK,
            WORK,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            CARRY,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE,
            MOVE
          ];
        } else if (room.energyAvailable >= 800) {
          body = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
        } else if (room.energyAvailable >= 550) {
          body = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE];
        }
      }

      if (body !== null) {
        spawns =
          spawns ||
          room.find(FIND_MY_SPAWNS, {
            /**
             * stub
             *
             * @param {any} object stub
             * @returns {boolean} stub
             */
            filter: (object) => object.spawning === null
          });
        if (spawns.length > 0) {
          const spawn = spawns.pop();
          if (!spawn) {
            continue;
          }
          spawn.spawnCreep(body, `${room.name}:${Game.time}`, { memory: { room: spawn.room.name } });
        }
      }
    } while (false);

    for (const creep of creeps[room_index]) {
      if (creep.memory.full) {
        if (creep.carry.energy === 0) {
          creep.memory.full = false;
        }
      } else {
        if (creep.carry.energy === creep.store.getCapacity(RESOURCE_ENERGY)) {
          creep.memory.full = true;
        }
      }

      let target;
      let result;

      if (creep.memory.full) {
        do {
          if (tanks === undefined) {
            tanks = _.filter(
              my_structures,
              (object) =>
                (object.structureType === STRUCTURE_SPAWN ||
                  object.structureType === STRUCTURE_EXTENSION ||
                  object.structureType === STRUCTURE_TOWER) &&
                object.store[RESOURCE_ENERGY] < object.store.getCapacity(RESOURCE_ENERGY)
            );
          }
          if (tanks.length > 0) {
            target = creep.pos.findClosestByRange(tanks);
            if (target !== null && (target as StructureStorage).store.getCapacity(RESOURCE_ENERGY) !== undefined) {
              result = creep.transfer(target, RESOURCE_ENERGY);
            } else {
              result = ERR_NOT_IN_RANGE;
            }
            break;
          }

          target = creep.pos.findClosestByRange(room.find(FIND_MY_CONSTRUCTION_SITES));
          if (target === null && creep.room.name !== room_index) {
            target = creep.pos.findClosestByRange(creep.room.find(FIND_MY_CONSTRUCTION_SITES));
          }
          if (target !== null) {
            result = creep.build(target);
            break;
          }

          if (repair === undefined) {
            repair = _.filter(my_structures, repair_filter);
            if (repair.length === 0 && room_index !== creep.room.name) {
              repair = creep.room.find(FIND_STRUCTURES, { filter: repair_filter });
            }
            repair.sort((a, b) => a.id.localeCompare(b.id));
          }
          if (repair.length > 0) {
            target = repair.pop();
            if (target === null || target === undefined) {
              break;
            }
            result = creep.repair(target);
            break;
          }

          target = creep.pos.findClosestByRange(
            creep.room.find(FIND_FLAGS, {
              /**
               * stub
               *
               * @param {any} flag stub
               * @returns {boolean} stub
               */
              filter: (flag) => flag.color === COLOR_YELLOW && flag.secondaryColor === COLOR_GREY
            })
          );
          if (target !== null) {
            result = ERR_NOT_IN_RANGE;
            break;
          }

          target = room.controller;
          if (target === null || target === undefined) {
            break;
          }
          result = creep.upgradeController(target);
        } while (false);
      } else {
        do {
          target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
            /**
             * stub
             *
             * @param {any} object stub
             * @returns {boolean} stub
             */
            filter: (object) => object.resourceType === RESOURCE_ENERGY
          });
          if (target !== null) {
            result = creep.pickup(target);
            break;
          }

          let sources: Source[] | Flag[] = creep.room.find(FIND_SOURCES_ACTIVE).filter((source) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const nearby_creeps = source.look_for_near(LOOK_CREEPS, true);
            // console.log(creeps, creeps.length);
            // if (creeps.length >= 3) {
            //   return false;
            // }
            return true;
          });
          if (sources.length === 0) {
            sources = creep.room.find(FIND_FLAGS, {
              /**
               * stub
               *
               * @param {any} flag stub
               * @returns {boolean} stub
               */
              filter: (flag) => flag.color === COLOR_YELLOW && flag.secondaryColor === COLOR_YELLOW
            });
          }
          target = creep.pos.findClosestByRange(sources as RoomObject[]);
          if (target !== null) {
            if ((target as Source).energy) {
              result = creep.harvest(target as Source);
            } else {
              result = ERR_NOT_IN_RANGE;
            }
            break;
          }

          if (creep.carry.energy > 0) {
            creep.memory.full = true;
          } else {
            target = creep.room.find(FIND_FLAGS, {
              /**
               * stub
               *
               * @param {any} object stub
               * @returns {boolean} stub
               */
              filter: (object) => object.color === COLOR_RED && object.secondaryColor === COLOR_WHITE
            });
            if (target.length > 0) {
              target = target.pop();
              result = ERR_NOT_IN_RANGE;
            }
          }
        } while (false);
      }

      if (result === ERR_NOT_IN_RANGE && target !== undefined && target !== null && !Array.isArray(target)) {
        creep.moveTo(target);
      }
    }
  }
};
