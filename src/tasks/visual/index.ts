import { EXTENDED_ROOM } from "extends/room";
import { KERNEL, TASK } from "system";
import { CONSTANTS, LOGGING } from "utils";

/**
 * handles room visuals
 *
 * @class
 */
export class ROOM_VISUAL_MANAGER_TASK extends TASK.TASK<EXTENDED_ROOM> {
  public id = "ROOM_VISUAL_MANAGER_TASK";

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
  public recalculate_assigned(): TASK.ASSIGN_INVALIDATE_FUNCTION<EXTENDED_ROOM> {
    this._assigned ??= [];
    const recalculate_expected_game_time = Game.time - (CONSTANTS.CLIENT_ABUSE_ROOM_TRACKER_CHECK_INTERVAL + 1);
    const rooms_memory = Memory.rooms ?? {};
    if (Object.keys(rooms_memory).length === 0) {
      return () => true;
    } else {
      // mark all rooms with spawns as main rooms, which will
      // always show visuals regardless of whether client abuse works
      for (const spawn of Object.values(Game.spawns)) {
        spawn.room.memory ??= {};
        spawn.room.memory.main_room = true;
      }
      for (const room_name in rooms_memory) {
        const room = Game.rooms[room_name];
        if (room && ((room.memory.last_viewed || 0) >= recalculate_expected_game_time || room.memory.main_room)) {
          this._assigned.push(new EXTENDED_ROOM(room));
        }
      }
      return (rooms: EXTENDED_ROOM[]) => {
        const rooms_in_memory = Memory.rooms ?? {};
        const expected_game_time = Game.time - (CONSTANTS.CLIENT_ABUSE_ROOM_TRACKER_CHECK_INTERVAL + 1);
        for (const room_to_check of rooms) {
          if (!rooms_in_memory[room_to_check.name]) {
            this._log.debug(`Invalidating room, no memory for ${room_to_check.name}`);
            return true;
          } else if (
            !rooms_in_memory[room_to_check.name].main_room &&
            (!rooms_in_memory[room_to_check.name].last_viewed ||
              (rooms_in_memory[room_to_check.name].last_viewed || 0) < expected_game_time)
          ) {
            this._log.debug(`Invalidating room, stale memory for ${room_to_check.name}`);
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
      this._log.verbose("Visuals ran, but no rooms were assigned");
      return {
        return_type: TASK.TASK_RETURN_TYPE.WAIT,
        wait_event: TASK.WAIT_EVENT_TYPE.WAIT_TIME,
        context: {
          time: CONSTANTS.TASK_ROOM_VISUAL_MANAGER_NO_ROOMS_WAIT_TIME
        }
      };
    }
    // do visual on all rooms
    this._log.debug(
      "Running visuals for: ",
      assigned.map((room) => room.name)
    );
    for (const room of assigned) {
      let visual = room.visual;
      if (visual?.circle === undefined) {
        this._log.verbose(`Room ${room.name} did not have a visual, creating one`);
        visual = new RoomVisual(room.name);
      }
      this._handle_room(room.room, visual);
    }
    return {
      return_type: TASK.TASK_RETURN_TYPE.CONTINUE
    };
  }

  /**
   * helper function to handle visuals for a single room
   *
   * @param {Room} room the room to handle visuals for
   * @param {RoomVisual} visual the RoomVisual object for the given room
   */
  private _handle_room(room: Room, visual: RoomVisual): void {
    // visual.circle(25, 25, {
    //   radius: 2,
    //   fill: "#dddddd",
    //   opacity: 0.5,
    //   stroke: "#ff00ff",
    //   strokeWidth: 0.1
    // });
    const creeps = room.find(FIND_MY_CREEPS);
    for (const creep of creeps) {
      if (creep.memory._move) {
        const { dest, path, room: move_room } = creep.memory._move;
        if (move_room === room.name) {
          visual.circle(dest.x, dest.y, {
            radius: 0.35,
            fill: "#60c060",
            opacity: 0.07,
            stroke: "#f01af0",
            strokeWidth: 0.05
          });
        }
        // draw a line along creep's intended path
      }
    }
  }
}

declare global {
  interface RoomMemory {
    main_room?: boolean;
  }

  interface CreepMemory {
    _move?: {
      dest: RoomPosition;
      path: string;
      room: string;
      time: number;
    };
  }
}
