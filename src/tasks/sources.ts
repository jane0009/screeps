import { EXTENDED_SOURCE } from "extends";
import { KERNEL, TASK } from "system";
import { CONSTANTS, LOGGING } from "utils";

/**
 * keeps source memory up to date
 *
 * @class
 */
export class SOURCE_UPKEEP_TASK extends TASK.TASK<EXTENDED_SOURCE> {
  public id = "SOURCE_UPKEEP_TASK";

  private _log: LOGGING.LOG_INTERFACE;

  /**
   * creates an instance of SOURCE_UPKEEP_TASK
   *
   * @constructs SOURCE_UPKEEP_TASK
   * @param {TASK.TASK_CONTEXT} context the task context
   * @param {KERNEL} kernel the kernel instance
   */
  public constructor(context: TASK.TASK_CONTEXT, kernel: KERNEL) {
    super(context, kernel);
    this._log = this._kernel.log_manager.get_logger(`SourceUpkeep`);
  }

  /**
   * See {@link TASK.inherent_priority}
   *
   * @returns {TASK.TASK_PRIORITY} idle priority
   */
  public get inherent_priority(): TASK.TASK_PRIORITY {
    return TASK.TASK_PRIORITY.IDLE;
  }

  /**
   * See {@link TASK.active}
   *
   * @returns {boolean} false
   */
  public get active(): boolean {
    return false;
  }

  /**
   * See {@link TASK.estimated_impact}
   *
   * @returns {number} 5
   */
  public get estimated_impact(): number {
    return 5;
  }

  /**
   * See {@link TASK.recalculate_assigned}
   *
   * @returns {ASSIGN_INVALIDATE_FUNCTION<any>} function to invalidate assigned rooms
   */
  public recalculate_assigned(): TASK.ASSIGN_INVALIDATE_FUNCTION<any> {
    this._assigned ??= [];
    const game_rooms = Game.rooms && Object.keys(Game.rooms);
    if (game_rooms.length === 0) {
      return () => true;
    } else {
      for (const room_name of game_rooms) {
        const room = Game.rooms[room_name];
        const sources = room.find(FIND_SOURCES);
        for (const source of sources) {
          this._assigned.push(new EXTENDED_SOURCE(source.id));
        }
      }
      return () => {
        return game_rooms.length !== Object.keys(Game.rooms).length;
      };
    }
  }

  /**
   * See {@link TASK.run}
   *
   * @returns {TASK.TASK_RETURN} return type
   */
  public run(): TASK.TASK_RETURN {
    Memory.sources ??= {};
    let updated = 0;
    for (const source of this._assigned) {
      Memory.sources[source.id] ??= {};
      const last_updated = Memory.sources[source.id].last_updated ?? 0;
      const next_update = last_updated + CONSTANTS.TASK_SOURCE_UPKEEP_UPDATE_INTERVAL;
      if (next_update > Game.time) {
        continue;
      }
      // calculate the number of open spaces
      source.open_spaces ??= this._calculate_open_spaces(source);
      Memory.sources[source.id].amount = source.energy;
      Memory.sources[source.id].capacity = source.energyCapacity;
      Memory.sources[source.id].open_spaces = source.open_spaces;
      Memory.sources[source.id].last_updated = Game.time;
      updated++;
    }
    if (updated !== 0) {
      return {
        return_type: TASK.TASK_RETURN_TYPE.CONTINUE
      };
    } else {
      return {
        return_type: TASK.TASK_RETURN_TYPE.WAIT,
        wait_event: TASK.WAIT_EVENT_TYPE.WAIT_TIME,
        context: {
          time: Math.floor(CONSTANTS.TASK_SOURCE_UPKEEP_UPDATE_INTERVAL / 2)
        }
      };
    }
  }

  /**
   * calculates the number of open spaces around a source
   *
   * @param {Source} source the source to calculate for
   * @returns {number} the number of open spaces
   */
  private _calculate_open_spaces(source: EXTENDED_SOURCE): number {
    const room = source.room;
    if (!room) {
      return 0;
    }
    const terrain = room.getTerrain();
    const source_x = source.pos.x;
    const source_y = source.pos.y;
    let open_spaces = 0;
    for (let x = source_x - 1; x <= source_x + 1; x++) {
      for (let y = source_y - 1; y <= source_y + 1; y++) {
        if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
          open_spaces++;
        }
      }
    }
    return open_spaces;
  }
}

// yes, this is redundant.
// no, I don't care.
declare global {
  interface SourceMemory {
    amount?: number;
    capacity?: number;
    last_updated?: number;
    open_spaces?: number;
  }

  interface Memory {
    sources: {
      [id: string]: SourceMemory;
    };
  }
}
