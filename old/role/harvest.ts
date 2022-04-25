import Pathing from '../screeps-pathfinding/pathing.js';
import RoleMemory from './roledata';
import SourceMemory from '../utils/SourceMemory';
type S = StructureSpawn | StructureExtension;
export default class Harvester extends RoleMemory {
  constructor(activeByDefault: boolean) {
    super(activeByDefault, "harvester");
  }
  get_spawn_limit(spawn: StructureSpawn): number {
    if (this.spawn_limit !== undefined && this.spawn_limit != -1) {
      return this.spawn_limit;
    }
    else {
      global.Logger.debug(`DETERMINING NUMBER OF SOURCES FOR ${spawn.room.name}`);
      let sources = spawn.room.find(FIND_SOURCES_ACTIVE);
      let availableSides = 0;
      for (let source of sources) {
        let container = new SourceMemory(source.id);
        availableSides += container.get_available_spaces();
      }
      this.spawn_limit = availableSides;
      return this.spawn_limit;
    }
  }
  execute_creep(_spawn: StructureSpawn, creep: Creep): void {

    if (creep.store.energy == 0 && creep.memory.working) {
      creep.memory.working = false;
      global.Logger.debug("not working")
    }
    else if (creep.store.energy == creep.store.getCapacity("energy") && !creep.memory.working) {
      creep.memory.working = true;
      global.Logger.debug("working")
    }

    let room = creep.room;

    if (!creep.memory.working) {
      let sources = room.find(FIND_SOURCES_ACTIVE, {
        filter: (source) => {
          return source.energy > 0;
        }
      });
      if (creep.harvest(sources[0]) != 0) {
        Pathing.moveTo(creep, sources[0]);
      }
    }
    else {
      if (!creep.memory.targets.depositor) {
        let containers = room.find(FIND_MY_STRUCTURES)
          .filter(
            (structure) => structure.structureType == 'spawn' || structure.structureType == 'extension' ||
              (false) // TODO storages that are marked as energy storage
          );
        let valid: S[] = [];
        containers.forEach(
          (structure) => {
            if (structure instanceof StructureSpawn || structure instanceof StructureExtension) {
              if (structure.store.energy < structure.store.getCapacity('energy')) {
                valid.push(structure);
              }
            }
          }
        );
        valid.sort(
          (a, b) => b.store.energy - a.store.energy
        );

        if (valid.length > 0) {
          creep.memory.targets.depositor = valid[0].id;
        }
        else {
          global.Logger.warn(`no valid locations to deposit found`);
          global.Logger.debug(`valid: ${valid} total: ${containers}`);
        }
      }
      let target = Game.getObjectById(creep.memory.targets.depositor);
      if (!target || (!(target instanceof StructureSpawn) && !(target instanceof StructureExtension))) return;
      let result = creep.transfer(target, RESOURCE_ENERGY);
      if (result == ERR_NOT_IN_RANGE) {
        Pathing.moveTo(creep, target);
      }
    }
  }
}
