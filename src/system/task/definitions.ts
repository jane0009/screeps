import { KERNEL } from "../kernel";
import { TASK } from "./task";

/**
 * The base class for all game objects
 *
 * @class
 */
export interface GAME_OBJECT {
  readonly _test: boolean;
}

export type PID = number;

export interface TASK_CONTEXT {
  parent: PID;
  pid: PID;
}

export enum TASK_PRIORITY {
  IDLE,
  BELOW_NORMAL,
  NORMAL,
  ABOVE_NORMAL,
  HIGH,
  REALTIME
}

export enum TASK_IMPORTANCE {
  IDLE,
  LOWEST,
  BELOW_NORMAL,
  NORMAL,
  ABOVE_NORMAL,
  HIGHEST,
  TIME_CRITICAL
}

export enum TASK_RETURN_TYPE {
  CONTINUE,
  WAIT,
  ABORT,
  EXIT
}

export interface WAIT_TIME_CONTEXT {
  time: number;
}

export interface WAIT_OBJECT_PROPERTY_CONTEXT {
  object_id: string | string[];
  wait_fn: WAIT_OBJECT_PROPERTY_FUNCTION;
}

export interface WAIT_TASK_CONTEXT {
  task_id: PID;
}

export type WAIT_CONTEXT = WAIT_TIME_CONTEXT | WAIT_OBJECT_PROPERTY_CONTEXT | WAIT_TASK_CONTEXT;

export interface TASK_RETURN {
  context?: WAIT_CONTEXT;
  return_type: TASK_RETURN_TYPE;
  wait_event?: WAIT_EVENT_TYPE;
}

export enum WAIT_EVENT_TYPE {
  WAIT_TIME,
  WAIT_OBJECT_PROPERTY,
  WAIT_TASK
}

export type TASK_CONSTRUCTOR = new (context: TASK_CONTEXT, kernel: KERNEL) => TASK<any>;

export type WAIT_OBJECT_PROPERTY_FUNCTION = (object: GAME_OBJECT) => boolean;

export type ASSIGN_INVALIDATE_FUNCTION<T extends any> = (actors: T[]) => boolean;
