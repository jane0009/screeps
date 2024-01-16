import { EXTENDED_SPAWN } from "extends";
import { KERNEL, TASK } from "system";
import { LOGGING } from "utils";

/**
 * handles creep spawn queue
 *
 * @class
 */
export class SPAWN_HANDLER_TASK extends TASK.TASK<EXTENDED_SPAWN> {
  public id = "SPAWN_HANDLER_TASK";

  private _log: LOGGING.LOG_INTERFACE;

  /**
   * creates an instance of SPAWN_HANDLER_TASK
   *
   * @constructs SPAWN_HANDLER_TASK
   * @param {TASK.TASK_CONTEXT} context the task context
   * @param {KERNEL} kernel the kernel instance
   */
  public constructor(context: TASK.TASK_CONTEXT, kernel: KERNEL) {
    super(context, kernel);
    this._log = this._kernel.log_manager.get_logger(`SpawnHandler`);
  }

  /**
   * See {@link TASK.inherent_priority}
   *
   * @returns {TASK.TASK_PRIORITY} above normal priority
   */
  public get inherent_priority(): TASK.TASK_PRIORITY {
    return TASK.TASK_PRIORITY.ABOVE_NORMAL;
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
   * @returns {number} 10
   */
  public get estimated_impact(): number {
    return 10;
  }

  /**
   * See {@link TASK.recalculate_assigned}
   *
   * @returns {ASSIGN_INVALIDATE_FUNCTION<any>} function to invalidate assigned rooms
   */
  public recalculate_assigned(): TASK.ASSIGN_INVALIDATE_FUNCTION<any> {
    return () => false;
  }

  /**
   * See {@link TASK.run}
   *
   * @returns {TASK_RETURN} success
   */
  public run(): TASK.TASK_RETURN {
    return {
      return_type: TASK.TASK_RETURN_TYPE.CONTINUE
    };
  }
}
