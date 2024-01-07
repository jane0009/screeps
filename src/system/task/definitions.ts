export abstract class GAME_OBJECT {}

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

export interface TASK_RETURN {
  context?: any;
  return_type: TASK_RETURN_TYPE;
  wait_event?: WAIT_EVENT_TYPE;
}

export enum WAIT_EVENT_TYPE {
  TIME,
  OBJECT_PROPERTY
}

export type WAIT_OBJECT_PROPERTY_FUNCTION = (object: GAME_OBJECT) => boolean;
