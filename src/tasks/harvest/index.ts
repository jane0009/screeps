import { KERNEL, TASK } from "system";
import { LOGGING } from "utils";

/**
 * handles harvesting (sources, minerals, etc.)
 *
 * @class
 */
export class HARVEST_TASK extends TASK.TASK<Creep> {
  private _log: LOGGING.LOG_INTERFACE;

  /**
   * creates an instance of HARVEST_TASK
   *
   * @constructs HARVEST_TASK
   * @param {TASK.TASK_CONTEXT} context the task context
   * @param {KERNEL} kernel the kernel instance
   */
  public constructor(context: TASK.TASK_CONTEXT, kernel: KERNEL) {
    super(context, kernel);
    this._log = this._kernel.log_manager.get_logger(`HarvestTask${context.pid}`);
  }

  /**
   * See {@link TASK.inherent_priority}
   *
   * @returns {TASK.TASK_PRIORITY} high priority
   */
  public get inherent_priority(): TASK.TASK_PRIORITY {
    return TASK.TASK_PRIORITY.HIGH;
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
   * @returns {number} 30
   */
  public get estimated_impact(): number {
    return 30;
  }

  /**
   * See {@link TASK.recalculate_assigned}
   *
   * @returns {TASK.ASSIGN_INVALIDATE_FUNCTION<Creep>} a function to invalidate assigned creeps
   */
  public recalculate_assigned(): TASK.ASSIGN_INVALIDATE_FUNCTION<Creep> {
    // this._assigned = this._context.room.find(FIND_SOURCES);
    return () => false;
  }

  /**
   * See {@link TASK.run}
   *
   * @returns {TASK.TASK_RETURN} return type
   */
  public run(): TASK.TASK_RETURN {
    return {
      return_type: TASK.TASK_RETURN_TYPE.CONTINUE
    };
  }
}
