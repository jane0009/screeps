import { KERNEL, TASK } from "system";
import { LOGGING } from "utils";

export class TEST_TASK extends TASK.TASK<any> {
  private log: LOGGING.LOG_INTERFACE;
  public constructor(context: TASK.TASK_CONTEXT, kernel: KERNEL) {
    super(context, kernel);
    this.log = this._kernel.log_manager.get_logger(`TestTask${context.pid}`);
  }

  public get inherent_priority(): TASK.TASK_PRIORITY {
    return TASK.TASK_PRIORITY.IDLE;
  }
  public get active(): boolean {
    return false;
  }

  public get estimated_impact(): number {
    return 1;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public run(actors: any[]): TASK.TASK_RETURN {
    this.log.info("Test task ran");
    return {
      return_type: TASK.TASK_RETURN_TYPE.EXIT
    };
  }
}
