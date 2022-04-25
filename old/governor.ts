import RoleMemory from "role/roledata";
import Harvester from './role/harvest';
import SpawnMemory from './utils/SpawnMemory';

export default class Governor {
  roles: RoleMemory[];
  constructor() {
    this.roles = [
      new Harvester(true)
    ];
  }

  run_role_code(spawn: StructureSpawn): void {
    for (let role of this.roles) {
      let budget = Game.cpu.tickLimit || 0;
      global.Logger.debug(`${role.name} ${role.get_spawn_limit(spawn)}`);
      if (!Game.cpu.limit) {
        role.run(spawn);
      }
      else {
        if (budget > 0) {
          role.run(spawn);
        }
      }
    }
  }

  handle_dead_creeps() {
    let budget = Game.cpu.tickLimit || 0;
    if (budget > 0) {
      // Automatically delete memory of missing creeps
      for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
          if (Memory.creeps[name].bootstrap) {
            global.Logger.warn(`A founding member, ${name}, has died.`);
          }
          delete Memory.creeps[name];
        }
      }
    }
  }

  handle_spawning(spawn: StructureSpawn): void {
    let budget = Game.cpu.tickLimit || 0;
    if (budget > 0) {
      let sq = new SpawnMemory(spawn.id);
      let res = sq.spawn_next();

      // 0 : OK
      // -101 : EMPTY QUEUE
      if (res != 0 && res != -101) {
        if (res < -100) {
          global.Logger.warn(`custom error code ${res}`);
        }
        else {
          global.Logger.warn(`regular error code ${res}`);
        }
      }
    }
  }

  manage(spawn: StructureSpawn): void {
    this.run_role_code(spawn);
    this.handle_dead_creeps();
    this.handle_spawning(spawn);
  }
}
