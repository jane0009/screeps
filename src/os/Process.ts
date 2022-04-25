import { Storeable } from "./Storage";

export type PID = number;

export default class Process extends Storeable {
  constructor(parent: PID, pid: PID, priority: number) {
    super();
    this._memory['parent'] = parent;
    this._memory['pid'] = pid;
    this._memory['priority'] = priority;
  }

  get parent() { return this._memory['parent'] }
  get pid() { return this._memory['pid'] }
  get priority() { return this._memory['priority'] }
}
