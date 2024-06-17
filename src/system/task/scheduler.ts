import profiler from "screeps-profiler";
import { CONSTANTS, LOGGING } from "utils";
import { KERNEL } from "../kernel";
import {
  ASSIGN_INVALIDATE_FUNCTION,
  TASK_CONSTRUCTOR,
  TASK_PRIORITY,
  TASK_RETURN,
  TASK_RETURN_TYPE,
  WAIT_EVENT_TYPE
} from "./definitions";
import { TASK } from "./task";

/**
 * the scheduler task
 *
 * @class
 * @implements {TASK}
 */
export class SCHEDULER extends TASK<any> {
  public id = "SCHEDULER";

  private _log: LOGGING.LOG_INTERFACE;
  private _wants_spawn: TASK_CONSTRUCTOR[] = [];
  /**
   * Creates an instance of SCHEDULER
   *
   * @constructs SCHEDULER
   * @param {KERNEL} kernel the kernel instance
   */
  public constructor(kernel: KERNEL) {
    super(
      {
        pid: 1,
        parent: 0
      },
      kernel
    );
    this._log = this._kernel.log_manager.get_logger("Scheduler");
  }

  /**
   * See {@link TASK.inherent_priority}
   */
  public get inherent_priority(): TASK_PRIORITY {
    return TASK_PRIORITY.REALTIME;
  }

  /**
   * See {@link TASK.active}
   */
  public get active(): boolean {
    return true;
  }

  /**
   * See {@link TASK.estimated_impact}
   */
  public get estimated_impact(): number {
    return 0;
  }

  /**
   * See {@link TASK.recalculate_assigned}
   */
  public recalculate_assigned(): ASSIGN_INVALIDATE_FUNCTION<any> {
    return () => false;
  }

  /**
   * indicates to the scheduler that a task wants to be spawned
   *
   * @param {TASK_CONSTRUCTOR} task the task to spawn
   */
  public register_task(task: TASK_CONSTRUCTOR): void {
    this._wants_spawn.push(task);
    this._wants_spawn.sort((a, b) => {
      const inst_a = new a({ pid: 0, parent: 0 }, this._kernel);
      const inst_b = new b({ pid: 0, parent: 0 }, this._kernel);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return inst_a.inherent_priority - inst_b.inherent_priority;
    });
  }

  /**
   * See {@link TASK.run}
   */
  public run(): TASK_RETURN {
    this._log.debug("Scheduler tick");
    let did_schedule = false;
    //
    for (const task_constructor of this._wants_spawn) {
      if (this._kernel.exists_of_type(task_constructor)) {
        continue;
      }
      this._log.verbose(`Attempt spawning new ${task_constructor.name}`);
      this._kernel.spawn(this, task_constructor);
      did_schedule = true;
    }
    //
    if (did_schedule) {
      return {
        return_type: TASK_RETURN_TYPE.CONTINUE
      };
    } else {
      this._log.verbose("Nothing scheduled");
      return {
        return_type: TASK_RETURN_TYPE.WAIT,
        wait_event: WAIT_EVENT_TYPE.WAIT_TIME,
        context: {
          time: CONSTANTS.SCHEDULER_NO_TASKS_WAIT_TIME
        }
      };
    }
  }
}

profiler.registerClass(SCHEDULER, "SCHEDULER");
