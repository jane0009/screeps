import { CONSTANTS, KERNEL, TASK } from "system";
import { ASSIGN_INVALIDATE_FUNCTION } from "system/task";
import { LOGGING } from "utils";

/**
 * handles room visuals
 *
 * @class
 */
export class ROOM_VISUAL_MANAGER_TASK extends TASK.TASK<Room> {
  private _log: LOGGING.LOG_INTERFACE;
  /**
   * creates an instance of ROOM_VISUAL_MANAGER_TASK
   *
   * @constructs ROOM_VISUAL_MANAGER_TASK
   * @param {TASK.TASK_CONTEXT} context the task context
   * @param {KERNEL} kernel the kernel instance
   */
  public constructor(context: TASK.TASK_CONTEXT, kernel: KERNEL) {
    super(context, kernel);
    this._log = this._kernel.log_manager.get_logger(`RoomVisualManager`);
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
   * @returns {boolean} true
   */
  public get active(): boolean {
    return true;
  }

  /**
   * See {@link TASK.estimated_impact}
   *
   * @returns {number} 20
   */
  public get estimated_impact(): number {
    return 20;
  }

  /**
   * See {@link TASK.recalculate_assigned}
   *
   * @returns {ASSIGN_INVALIDATE_FUNCTION<Room>} function to invalidate assigned rooms
   */
  public recalculate_assigned(): ASSIGN_INVALIDATE_FUNCTION<Room> {
    const rooms_memory = Memory.rooms ?? {};
    if (Object.keys(rooms_memory).length === 0) {
      return () => true;
    } else {
      for (const room_name in rooms_memory) {
        const room = Game.rooms[room_name];
        if (room) {
          this._assigned.push(room);
        }
      }
      return (rooms: Room[]) => {
        const rooms_in_memory = Memory.rooms ?? {};
        const expected_game_time = Game.time - (CONSTANTS.CLIENT_ABUSE_ROOM_TRACKER_CHECK_INTERVAL + 1);
        for (const room_to_check of rooms) {
          if (!rooms_in_memory[room_to_check.name]) {
            return true;
          } else if (
            !rooms_in_memory[room_to_check.name].last_viewed ||
            (rooms_in_memory[room_to_check.name].last_viewed || 0) < expected_game_time
          ) {
            return true;
          }
        }
        return false;
      };
    }
  }

  /**
   * See {@link TASK.run}
   *
   * @returns {TASK.TASK_RETURN} return type
   */
  public run(): TASK.TASK_RETURN {
    const assigned = this._assigned;
    if (!assigned.length) {
      return {
        return_type: TASK.TASK_RETURN_TYPE.WAIT,
        wait_event: TASK.WAIT_EVENT_TYPE.WAIT_TIME,
        context: {
          time: CONSTANTS.TASK_ROOM_VISUAL_MANAGER_NO_ROOMS_WAIT_TIME
        }
      };
    }
    return {
      return_type: TASK.TASK_RETURN_TYPE.CONTINUE
    };
  }
}
