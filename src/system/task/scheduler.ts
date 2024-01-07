import { TEST_TASK } from "tasks/test";
import { LOGGING } from "utils";
import * as CONSTANTS from "../constants";
import { KERNEL } from "../kernel";
import { TASK_PRIORITY, TASK_RETURN, TASK_RETURN_TYPE, WAIT_EVENT_TYPE } from "./definitions";
import { TASK } from "./task";

export class SCHEDULER extends TASK<any> {
  private log: LOGGING.LOG_INTERFACE;
  public constructor(kernel: KERNEL) {
    super(
      {
        pid: 1,
        parent: 0
      },
      kernel
    );
    this.log = this._kernel.log_manager.get_logger("Scheduler");
  }

  public get inherent_priority(): TASK_PRIORITY {
    return TASK_PRIORITY.REALTIME;
  }

  public get active(): boolean {
    return true;
  }

  public get estimated_impact(): number {
    return 0;
  }

  public run(): TASK_RETURN {
    this.log.debug("Scheduler tick");
    const did_schedule = false;
    for (let i = 0; i < 5; i++) {
      this._kernel.spawn(this, TEST_TASK);
    }
    if (did_schedule) {
      return {
        return_type: TASK_RETURN_TYPE.CONTINUE
      };
    } else {
      this.log.verbose("Nothing scheduled");
      return {
        return_type: TASK_RETURN_TYPE.WAIT,
        wait_event: WAIT_EVENT_TYPE.TIME,
        context: CONSTANTS.SCHEDULER_NO_TASKS_WAIT_TIME
      };
    }
  }
}
