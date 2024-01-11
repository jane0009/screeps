import { KERNEL, TASK } from "system";
import { LOGGING } from "utils";

/**
 * a test task
 *
 * @class
 */
export class TEST_TASK extends TASK.TASK<any> {
  private log: LOGGING.LOG_INTERFACE;

  /**
   * creates an instance of TEST_TASK
   *
   * @constructs TEST_TASK
   * @param {TASK.TASK_CONTEXT} context the task context
   * @param {KERNEL} kernel the kernel instance
   */
  public constructor(context: TASK.TASK_CONTEXT, kernel: KERNEL) {
    super(context, kernel);
    this.log = this._kernel.log_manager.get_logger(`TestTask${context.pid}`);
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
   * @returns {number} 1
   */
  public get estimated_impact(): number {
    return 1;
  }

  /**
   * See {@link TASK.recalculate_assigned}
   *
   * @returns {TASK.ASSIGN_INVALIDATE_FUNCTION<any>} function to invalidate assigned rooms
   */
  public recalculate_assigned(): TASK.ASSIGN_INVALIDATE_FUNCTION<any> {
    return () => false;
  }

  /**
   * See {@link TASK.run}
   *
   * @returns {TASK.TASK_RETURN} return type
   */
  public run(): TASK.TASK_RETURN {
    this.log.info("Test task ran");
    return {
      return_type: TASK.TASK_RETURN_TYPE.EXIT
    };
  }
}
