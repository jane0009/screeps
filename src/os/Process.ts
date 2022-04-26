import { Storeable } from "./Storeable";

export type PID = number;

export default class Process extends Storeable {
  public constructor(parent: PID, pid: PID, priority: number) {
    super();
    this._memory.parent = parent;
    this._memory.pid = pid;
    this._memory.priority = priority;
  }

  public get parent(): PID {
    return this._memory.parent;
  }
  public get pid(): PID {
    return this._memory.pid;
  }
  public get priority(): number {
    return this._memory.priority;
  }
}
