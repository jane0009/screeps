import { CacheMethod, keyById, memoryCache, memoryCacheGetter } from "screeps-cache";
import CreepSpawn from "./extends/CreepSpawn";

interface RoleSpawns {
  [role: string]: boolean;
}

export default class SpawnMemory {
  constructor(public id: Id<StructureSpawn>) {
    this.queue = [];
    this.role_spawning = {};
  }

  @memoryCacheGetter(keyById, (i: SpawnMemory) => Game.getObjectById(i.id)?.pos)
  public pos?: RoomPosition;

  @memoryCache(keyById)
  public queue: CreepSpawn[];

  @memoryCache(keyById)
  role_spawning: RoleSpawns;

  has_next(): boolean {
    return this.queue.length > 0;
  }

  spawn_next(): number {
    if (this.has_next()) {
      let spawn = Game.getObjectById(this.id);
      let creep = this.queue.shift();
      if (creep == undefined) return -103;
      if (!spawn?.spawning) {
        return spawn?.spawnCreep(creep.body, `${++Memory.id}`, { memory: creep.memory }) || -104;
      }
      return -102;
    }
    return -101;
  }

  check_creep_parts(parts: BodyPartConstant[], creep: Creep): boolean {
    for (let part of parts) {
      let parts = creep.getActiveBodyparts(part);
      if (parts < 1) {
        return false;
      }
    }
    return true;
  }

  maximize(order: BodyPartConstant[]): BodyPartConstant[] {
    let spawn = Game.getObjectById(this.id);

    if (spawn != null) {
      let next_move = 2;
      let energy = spawn.room.energyAvailable;
      let index = 0;
      let result: BodyPartConstant[] = [];
      while (energy > BODYPART_COST[order[index]]) {
        if (next_move <= 0) {
          if (energy > BODYPART_COST.move) {
            result.push(MOVE);
            energy -= BODYPART_COST.move;
            next_move = 2;
          }
          else {
            break;
          }
        }
        else {
          next_move--;
        }

        if (energy > BODYPART_COST[order[index]]) {
        energy -= BODYPART_COST[order[index]];
        result.push(order[index]);
          index = (index + 1) % order.length;
        }
        else {
          break;
        }
      }

      return result;
    }
    return [];
  }

  public get_new_creep(role: string, order: BodyPartConstant[]): Id<Creep> | undefined {
    global.Logger.debug("get_new_creep");
    global.Logger.debug(`${this.role_spawning[role]}`);
    if (this.role_spawning[role] == undefined) {
      this.role_spawning[role] = false;
    }
    if (this.role_spawning[role] == true) {
      let new_creeps = _(Game.creeps).filter(
        (creep: Creep) => creep.memory.state?.new && creep.memory.state?.role == role
      );
      if (new_creeps.size() > 0) {
        let creep: Creep = new_creeps.get(0);
        if (creep.memory.state) {
          creep.memory.state.new = false;
        }
        this.role_spawning[role] = false;
        return creep.id;
      }
      return undefined;
    }
    let assignable_creeps = _(Game.creeps).filter(
      (creep: Creep) => creep.memory.assigned == false && this.check_creep_parts(order, creep)
    );
    global.Logger.debug(`${assignable_creeps}`)
    if (assignable_creeps.size() > 0) {
      let creep: Creep = assignable_creeps.get(0);
      creep.memory.assigned = true;
      return creep.id;
    }

    this.role_spawning[role] = true;

    let body = this.maximize(order);
    global.Logger.debug(`pushing new creep with body ${body}`);

    let q = this.queue;
    q.push(new CreepSpawn(body, {
      bootstrap: false,
      working: false,
      assigned: true,
      targets: {},
      state: {
        new: true,
        role: role
      }
    }));
    console.log(Object.keys(this.queue))
    this.queue = q;

    global.Logger.debug(`queue_test ${JSON.stringify(this.queue)}`);

    return undefined;
  }
}
