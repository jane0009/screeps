import { keyByName, memoryCache } from "screeps-cache";
import SpawnMemory from "utils/SpawnMemory";

export default abstract class RoleMemory {
  constructor(activeByDefault: boolean, name: string = "no name") {
    this.active = activeByDefault;
    this.name = name;
  }
  @memoryCache(keyByName)
  public assigned_creeps: Array<Id<Creep>> = [];

  @memoryCache(keyByName)
  public active: boolean = false;

  @memoryCache(keyByName)
  public spawn_limit: number = -1;

  public name: string;

  // constant so does not need caching.
  // include default order
  // TODO better body part determination
  public part_order: BodyPartConstant[] = [
    WORK, CARRY
  ];

  abstract get_spawn_limit(spawn: StructureSpawn): number;
  abstract execute_creep(spawn: StructureSpawn, creep: Creep): void;

  run(spawn: StructureSpawn): void {
    if (!this.assigned_creeps) {
      this.assigned_creeps = [];
    }
    if (this.assigned_creeps.length) {
      for (let id of this.assigned_creeps) {
        let creep = Game.getObjectById(id);
        if (!creep || !Game.creeps[creep.name]) {
          this.assigned_creeps =
            this.assigned_creeps.filter(
              (cr: Id<Creep>) => cr != id
            );
        }
        creep && !creep.spawning && this.execute_creep(spawn, creep);
      }
    }
    let s = new SpawnMemory(spawn.id);
    if (this.check_spawn()) {
      global.Logger.debug("check_spawn");
      for (let _ in s) {}
      if (!this.assigned_creeps) {
        this.assigned_creeps = [];
      }
      let result = s.get_new_creep(this.name, this.part_order);
      if (result != undefined) {
        this.assigned_creeps.push(result);
      }
    }
    for (let _ in s) { }
    global.Logger.debug("after_check");
    let s2 = new SpawnMemory(spawn.id);
    global.Logger.debug(`after_queue 1 ${JSON.stringify(s.queue)}\n2 ${JSON.stringify(s2.queue)}`);
  }

  check_spawn(): boolean {
    let len = this.assigned_creeps.length;

    global.Logger.debug(`len: ${len}, lim: ${this.spawn_limit}, res: ${this.spawn_limit > len}`);
    return len != undefined ? this.spawn_limit > len : false;
  }
}
