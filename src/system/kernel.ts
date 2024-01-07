import { LOGGING, SPANS } from "utils";
import * as CONSTANTS from "./constants";
import * as TASK from "./task";
import { SCHEDULER } from "./task/scheduler";

enum QUEUE_TYPE {
  REAL_TIME,
  NORMAL
}

type QUEUE = TASK.PID[];
type WAIT_QUEUE = {
  context: any;
  next_check: number;
  pid: TASK.PID;
  wait_event: TASK.WAIT_EVENT_TYPE;
}[];

export class KERNEL {
  /* used for checking the next available pid */
  private _highest_pid: TASK.PID = 1;
  /* get the next available pid */
  private get _next_pid(): TASK.PID {
    let missing_pid = 0;
    for (let i = 1; i < this._highest_pid + 1; i++) {
      if (this._task_list[i] === undefined) {
        missing_pid = i;
        break;
      }
    }
    return missing_pid || ++this._highest_pid;
  }
  private _kernel_loggers: {
    main: LOGGING.LOG_INTERFACE;
    pedantic_debugging: LOGGING.LOG_INTERFACE;
    performance: LOGGING.LOG_INTERFACE;
  };
  private _log_manager: LOGGING.LOG_MANAGER;

  private _previous_overhead: number = CONSTANTS.KERNEL_MINIMUM_CPU_OVERHEAD;

  private _ready_queues: QUEUE[];
  private _running_queue: {
    [QUEUE_TYPE.NORMAL]: QUEUE;
    [QUEUE_TYPE.REAL_TIME]: QUEUE;
  } = {
    [QUEUE_TYPE.REAL_TIME]: [],
    [QUEUE_TYPE.NORMAL]: []
  };
  private _task_list: {
    [pid: TASK.PID]: TASK.TASK<any>;
  };
  private _wait_queue: {
    [QUEUE_TYPE.NORMAL]: WAIT_QUEUE;
    [QUEUE_TYPE.REAL_TIME]: WAIT_QUEUE;
  } = {
    [QUEUE_TYPE.REAL_TIME]: [],
    [QUEUE_TYPE.NORMAL]: []
  };

  public constructor() {
    this._log_manager = global.log_manager;
    this._kernel_loggers = {
      main: this._log_manager.get_logger("Kernel"),
      performance: this._log_manager.get_logger("Performance"),
      pedantic_debugging: this._log_manager.get_logger("Kernel_Pedantic")
    };
    this._task_list = {
      1: new SCHEDULER(this)
    };
    this._ready_queues ??= [];
    for (let i = 0; i < CONSTANTS.KERNEL_READY_QUEUES; i++) {
      this._ready_queues[i] ??= [];
    }
  }

  // init and misc
  public init(): void {
    this._kernel_loggers.main.debug("Reinitializing kernel");
    // scheduler should always run on the first tick
    this._running_queue[QUEUE_TYPE.REAL_TIME].push(this._task_list[1].pid);
  }

  public get log_manager(): LOGGING.LOG_MANAGER {
    return this._log_manager;
  }

  // scheduling
  public spawn(
    parent: TASK.TASK<any>,
    child: new (context: TASK.TASK_CONTEXT, kernel: KERNEL) => TASK.TASK<any>
  ): void {
    const child_context = {
      pid: this._next_pid,
      parent: parent.pid
    };
    this._kernel_loggers.main.debug(`Spawning ${child.name} from ${parent.constructor.name}:`, child_context);
    this._task_list[child_context.pid] = new child(child_context, this);
    const middle_queue = Math.ceil(CONSTANTS.KERNEL_READY_QUEUES / 2);
    // arrays are zero indexed.
    this._ready_queues[middle_queue - 1].push(child_context.pid);
  }

  public get scheduler(): SCHEDULER {
    return this._task_list[1] as SCHEDULER;
  }

  // ticking
  public tick(): void {
    const rt_run_meter = new SPANS.CPU_METER();
    // handle real-time running queue
    this._handle_running_queue(QUEUE_TYPE.REAL_TIME);
    this._kernel_loggers.performance.debug(`Real-time queue took ${rt_run_meter.used} CPU`);

    // handle normal running queue
    const nrm_run_meter = new SPANS.CPU_METER();
    this._handle_running_queue(QUEUE_TYPE.NORMAL);
    this._kernel_loggers.performance.debug(`Normal queue took ${nrm_run_meter.used} CPU`);

    // handle real-time wait queue
    const rt_wait_meter = new SPANS.CPU_METER();
    this._handle_wait_queue(QUEUE_TYPE.REAL_TIME);
    this._kernel_loggers.performance.debug(`Real-time wait took ${rt_wait_meter.used} CPU`);

    // handle normal wait queue
    const nrm_wait_meter = new SPANS.CPU_METER();
    this._handle_wait_queue(QUEUE_TYPE.NORMAL);
    this._kernel_loggers.performance.debug(`Normal wait took ${nrm_wait_meter.used} CPU`);

    // handle ready queues in order of priority
    const allowed_cpu = Game.cpu.limit - (Game.cpu.getUsed() + this._previous_overhead);
    const estimated_used_cpu = 0;
    for (const idx in this._ready_queues) {
      const check_interval =
        CONSTANTS.KERNEL_READY_QUEUE_TICK_BASE + CONSTANTS.KERNEL_READY_QUEUE_TICK_MULTIPLIER * parseInt(idx, 10);
      if (Game.time % check_interval !== 0) continue;
      this._kernel_loggers.pedantic_debugging.debug(`Checking ready queue ${idx}`);
      const queue = this._ready_queues[idx];
      if (queue.length === 0) continue;
      queue.sort((a, b) => {
        this._kernel_loggers.pedantic_debugging.debug(
          `Sort.. ${a}: ${this._task_list[a].inherent_priority} vs ${b}: ${this._task_list[b].inherent_priority}`
        );
        return this._task_list[a].inherent_priority - this._task_list[b].inherent_priority;
      });
      while (queue.length > 0) {
        const pid = queue.shift();
        if (pid === undefined) {
          this._kernel_loggers.main.warn(`Queue ${idx} was empty, skipping`);
          continue;
        }
        const task = this._task_list[pid];
        if (task === undefined) {
          this._kernel_loggers.main.warn(`Task ${pid} was undefined, skipping`);
          continue;
        }
        this._kernel_loggers.pedantic_debugging.debug(`Checking task ${pid} from ready queue ${idx}`);
        const impact = task.actual_impact || task.estimated_impact;
        if (estimated_used_cpu + impact > allowed_cpu) {
          this._kernel_loggers.main.debug(`Task ${pid} would exceed allowed CPU, skipping`);
          queue.push(pid);
          continue;
        }
      }
    }

    // clean up dead tasks
    for (const key in this._task_list) {
      const pid = parseInt(key, 10);
      const running =
        this._running_queue[QUEUE_TYPE.REAL_TIME].indexOf(pid) !== -1 ||
        this._running_queue[QUEUE_TYPE.NORMAL].indexOf(pid) !== -1;
      if (running) continue;
      const waiting =
        this._wait_queue[QUEUE_TYPE.REAL_TIME].findIndex((wait_context) => wait_context.pid === pid) !== -1 ||
        this._wait_queue[QUEUE_TYPE.NORMAL].findIndex((wait_context) => wait_context.pid === pid) !== -1;
      if (waiting) continue;
      const ready = this._ready_queues.findIndex((queue) => queue && queue.indexOf(pid) !== -1) !== -1;
      if (ready) continue;
      this._kernel_loggers.main.debug(`Removing dead task ${pid}`);
      delete this._task_list[pid];
    }
    this._previous_overhead = rt_wait_meter.used_exact;
    this._kernel_loggers.performance.debug(`Total kqueue overhead was ${this._previous_overhead} CPU`);
  }

  private _handle_running_queue(queue_type: QUEUE_TYPE) {
    for (const pid of this._running_queue[queue_type]) {
      const task = this._task_list[pid];
      // TODO actors
      const result = task.tick([]);
      this._kernel_loggers.pedantic_debugging.debug("result:", result);
      switch (result.return_type) {
        case TASK.TASK_RETURN_TYPE.WAIT: {
          // remove from the running queue
          this._running_queue[queue_type].splice(this._running_queue[queue_type].indexOf(pid), 1);
          const wait_event = result.wait_event;
          if (wait_event === undefined) {
            this._kernel_loggers.main.warn(`${pid} waiting for nothing, treating as terminated`);
            continue;
          }
          const next_check_time =
            wait_event === TASK.WAIT_EVENT_TYPE.TIME
              ? (result.context as number)
              : CONSTANTS.KERNEL_REALTIME_WAIT_CHECK_INTERVAL;
          this._wait_queue[queue_type].push({
            pid,
            next_check: Game.time + next_check_time,
            wait_event,
            context: result.context
          });
          continue;
        }
        case TASK.TASK_RETURN_TYPE.ABORT: {
          this._kernel_loggers.main.warn(`${pid} aborted...`, result.context);
        }
        // eslint-disable-next-line no-fallthrough
        case TASK.TASK_RETURN_TYPE.EXIT: {
          // remove from the running queue
          this._running_queue[queue_type].splice(this._running_queue[queue_type].indexOf(pid), 1);
        }
        // eslint-disable-next-line no-fallthrough
        case TASK.TASK_RETURN_TYPE.CONTINUE:
        default: {
          continue;
        }
      }
    }
  }

  private _handle_wait_queue(queue_type: QUEUE_TYPE) {
    for (const wait_context of this._wait_queue[queue_type]) {
      this._kernel_loggers.pedantic_debugging.debug("wait context:", wait_context);
      if (wait_context.next_check > Game.time) {
        continue;
      }
      switch (wait_context.wait_event) {
        case TASK.WAIT_EVENT_TYPE.TIME: {
          // that's already handled by next_check
          this._wait_queue[queue_type].splice(this._wait_queue[queue_type].indexOf(wait_context), 1);
          this._running_queue[queue_type].push(wait_context.pid);
          continue;
        }
        default: {
          this._kernel_loggers.main.warn(`Unhandled wait event type ${wait_context.wait_event}`);
        }
      }
      const task = this._task_list[wait_context.pid];
    }
  }
}
