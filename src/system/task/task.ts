import { KERNEL } from "system/kernel";
import { GAME_OBJECT, PID, TASK_CONTEXT, TASK_PRIORITY, TASK_RETURN } from "./definitions";

export abstract class TASK<T extends GAME_OBJECT> {
  public actual_impact = 0;
  public cpu = 0;
  protected _context: TASK_CONTEXT;
  protected _kernel: KERNEL;
  private _age = 0;

  public constructor(context: TASK_CONTEXT, kernel: KERNEL) {
    this._context = context;
    this._kernel = kernel;
  }

  public defer(time: number): void {
    this._age += time;
  }

  public tick(actors: T[]): TASK_RETURN {
    this._age = 0;
    return this.run(actors);
  }

  public get pid(): PID {
    return this._context.pid;
  }

  public get parent(): PID {
    return this._context.parent;
  }

  abstract get inherent_priority(): TASK_PRIORITY;
  abstract get active(): boolean;

  abstract get estimated_impact(): number;

  // ticking
  abstract run(actors: T[]): TASK_RETURN;
}
