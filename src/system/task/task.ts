import { KERNEL } from "system/kernel";
import { ASSIGN_INVALIDATE_FUNCTION, PID, TASK_CONTEXT, TASK_PRIORITY, TASK_RETURN } from "./definitions";

/**
 * base class for all tasks
 *
 * @abstract
 * @class
 */
export abstract class TASK<T extends any> {
  public actual_impact = 0;
  public cpu = 0;
  protected _assigned: T[] = [];
  protected _context: TASK_CONTEXT;
  protected _kernel: KERNEL;
  private _age = 0;

  /**
   * creates an instance of TASK
   *
   * @param {TASK_CONTEXT} context the task context
   * @param {KERNEL} kernel the kernel instance
   */
  public constructor(context: TASK_CONTEXT, kernel: KERNEL) {
    this._context = context;
    this._kernel = kernel;
  }

  /**
   * defers the task for {@link time} ticks
   *
   * @param {number} time the number of ticks to defer
   */
  public defer(time: number): void {
    this._age += time;
  }

  /**
   * ticks the task, used by kernel
   * internal wrapper around run
   *
   * @returns {TASK_RETURN} information on the task's post-tick state
   */
  public tick(): TASK_RETURN {
    this._age = 0;
    return this.run();
  }

  /**
   * gets the task's process id
   *
   * @returns {PID} process id
   */
  public get pid(): PID {
    return this._context.pid;
  }

  /**
   * gets the task parent's process id
   *
   * @returns {PID} process id
   */
  public get parent(): PID {
    return this._context.parent;
  }

  /**
   * gets the "inherent priority" of the task
   * used for calculations on whether the task should be run, based
   * on current CPU usage
   *
   * @abstract
   * @returns {TASK_PRIORITY} the inherent priority
   */
  abstract get inherent_priority(): TASK_PRIORITY;

  /**
   * gets whether the task is active or passive, as a boolean
   * currently not used, will possibly be removed
   *
   * @abstract
   * @returns {boolean} the active state
   */
  abstract get active(): boolean;

  /**
   * gets the estimated impact of the task, used for when a task's actual impact has not been calculated yet
   * used for impact calculations
   *
   * @abstract
   * @returns {number} the estimated impact
   */
  abstract get estimated_impact(): number;

  /**
   * decides which objects are assigned top this task.
   *
   * @abstract
   * @param {T[]} parent_assignation the list of objects assigned by the parent task, optional
   */
  abstract recalculate_assigned(parent_assignation?: T[]): ASSIGN_INVALIDATE_FUNCTION<T>;

  /**
   * the internal run method, which handles the per-tick logic for tasks
   *
   * @abstract
   * @returns {TASK_RETURN} information on the task's post-tick state
   */
  abstract run(): TASK_RETURN;
}
