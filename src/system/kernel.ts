import profiler from "screeps-profiler";
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
  context: TASK.WAIT_CONTEXT;
  next_check: number;
  pid: TASK.PID;
  wait_event: TASK.WAIT_EVENT_TYPE;
}[];

/**
 * the kernel is the main system of the game; handles scheduling, spawning, and other misc tasks
 *
 * @class
 */
export class KERNEL {
  private _highest_pid: TASK.PID = 1;
  /**
   * get the next available pid
   *
   * @returns  {TASK.PID} pid
   */
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
  private _invalidate_functions: {
    [pid: TASK.PID]: TASK.ASSIGN_INVALIDATE_FUNCTION<any>;
  } = {};
  private _kernel_loggers: {
    main: LOGGING.LOG_INTERFACE;
    pedantic_debugging: LOGGING.LOG_INTERFACE;
    performance: LOGGING.LOG_INTERFACE;
    queue: LOGGING.LOG_INTERFACE;
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

  /**
   * creates an instance of KERNEL.
   *
   * @constructs KERNEL
   */
  public constructor() {
    this._log_manager = global.log_manager;
    this._kernel_loggers = {
      main: this._log_manager.get_logger("Kernel"),
      performance: this._log_manager.get_logger("Performance"),
      pedantic_debugging: this._log_manager.get_logger("Kernel_Pedantic"),
      queue: this._log_manager.get_logger("Kernel_Queue")
    };
    this._task_list = {
      1: new SCHEDULER(this)
    };
    this._ready_queues ??= [];
    for (let i = 0; i < CONSTANTS.KERNEL_READY_QUEUES; i++) {
      this._ready_queues[i] ??= [];
    }
  }

  /**
   * check if a task exists in the task list
   *
   * @param  {TASK.TASK_CONSTRUCTOR} task task constructor
   * @returns {boolean} exists
   */
  public exists_of_type(task: TASK.TASK_CONSTRUCTOR): boolean {
    for (const pid in this._task_list) {
      if (this._task_list[pid] instanceof task) {
        return true;
      }
    }
    return false;
  }

  // init and misc
  /**
   * initializes anything that could not be handled in the constructor
   */
  public init(): void {
    this._kernel_loggers.main.debug("Reinitializing kernel");
    // scheduler should always run on the first tick
    this._running_queue[QUEUE_TYPE.REAL_TIME].push(this._task_list[1].pid);
  }

  /**
   * gets the log manager for the kernel. used in tasks
   *
   * @returns {LOGGING.LOG_MANAGER} log manager
   */
  public get log_manager(): LOGGING.LOG_MANAGER {
    return this._log_manager;
  }

  // scheduling
  /**
   * spawns a new task and inserts it into the running queue
   *
   * @param  {TASK.TASK<any>} parent the parent task
   * @param  {TASK.TASK_CONSTRUCTOR} child the child task
   */
  public spawn(parent: TASK.TASK<any>, child: TASK.TASK_CONSTRUCTOR): void {
    const child_context = {
      pid: this._next_pid,
      parent: parent.pid
    };
    this._kernel_loggers.pedantic_debugging.debug(
      `Spawning ${child.name} from ${parent.constructor.name}:`,
      child_context
    );
    this._task_list[child_context.pid] = new child(child_context, this);
    const middle_queue = Math.ceil(CONSTANTS.KERNEL_READY_QUEUES / 2);
    // arrays are zero indexed.
    this._ready_queues[middle_queue - 1].push(child_context.pid);
  }

  /**
   * gets the scheduler task, which is always at pid 1
   *
   * @returns {SCHEDULER} scheduler
   */
  public get scheduler(): SCHEDULER {
    return this._task_list[1] as SCHEDULER;
  }

  // ticking
  /**
   * runs every tick inside the game loop
   */
  public tick(): void {
    this._kernel_loggers.queue.debug("Task list:", this._get_serialized_task_list());
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
      if (Game.time % check_interval !== 0) {
        continue;
      }
      this._kernel_loggers.pedantic_debugging.debug(`Checking ready queue ${idx}`);
      const queue = this._ready_queues[idx];
      if (queue.length === 0) {
        continue;
      }
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
          this._kernel_loggers.main.warn(`Task ${pid} was not specified in the task list, skipping`);
          continue;
        }
        this._kernel_loggers.queue.debug(`Checking task ${pid} from ready queue ${idx}`);
        const impact = task.actual_impact || task.estimated_impact;
        if (estimated_used_cpu + impact > allowed_cpu) {
          this._kernel_loggers.performance.warn(`Task ${pid} would exceed allowed CPU, skipping`);
          queue.push(pid);
          continue;
        }
        this._kernel_loggers.queue.debug(`Inserting task ${pid} from ready queue ${idx} into running queue`);
        const queue_type =
          task.inherent_priority === TASK.TASK_PRIORITY.REALTIME ? QUEUE_TYPE.REAL_TIME : QUEUE_TYPE.NORMAL;
        this._running_queue[queue_type].push(pid);
      }
    }

    // clean up dead tasks
    for (const key in this._task_list) {
      const pid = parseInt(key, 10);
      const running =
        this._running_queue[QUEUE_TYPE.REAL_TIME].indexOf(pid) !== -1 ||
        this._running_queue[QUEUE_TYPE.NORMAL].indexOf(pid) !== -1;
      if (running) {
        continue;
      }
      const waiting =
        this._wait_queue[QUEUE_TYPE.REAL_TIME].findIndex((wait_context) => wait_context.pid === pid) !== -1 ||
        this._wait_queue[QUEUE_TYPE.NORMAL].findIndex((wait_context) => wait_context.pid === pid) !== -1;
      if (waiting) {
        continue;
      }
      const ready = this._ready_queues.findIndex((queue) => queue && queue.indexOf(pid) !== -1) !== -1;
      if (ready) {
        continue;
      }
      this._kernel_loggers.queue.verbose(`Removing dead task ${pid}`);
      delete this._task_list[pid];
      delete this._invalidate_functions[pid];
    }

    // clean up orphaned assign functions
    for (const pid in this._invalidate_functions) {
      if (this._task_list[pid] === undefined) {
        this._kernel_loggers.queue.verbose(`Removing orphaned assign function for ${pid}`);
        delete this._invalidate_functions[pid];
      }
    }
    this._previous_overhead = rt_wait_meter.used_exact;
    this._kernel_loggers.performance.verbose(`Total kqueue overhead was ${this._previous_overhead} CPU`);
  }

  /**
   * helper function for printing the task list
   *
   * @returns {string[]} serialized task list
   */
  private _get_serialized_task_list(): string[] {
    const serialized_task_list: string[] = [];
    for (const pid in this._task_list) {
      const task = this._task_list[pid];
      serialized_task_list.push(`${pid}:${task.constructor.name}`);
    }
    return serialized_task_list;
  }

  /**
   * handles the running queue {@link _running_queue} inside of tick
   *
   * @param  {QUEUE_TYPE} queue_type the queue type to handle
   */
  private _handle_running_queue(queue_type: QUEUE_TYPE) {
    for (const pid of this._running_queue[queue_type]) {
      const task = this._task_list[pid];
      const result = task.tick();
      this._kernel_loggers.queue.debug(`result of ${task.constructor.name}:`, result);
      switch (result.return_type) {
        case TASK.TASK_RETURN_TYPE.WAIT: {
          // remove from the running queue
          this._running_queue[queue_type].splice(this._running_queue[queue_type].indexOf(pid), 1);
          const wait_event = result.wait_event;
          if (wait_event === undefined) {
            this._kernel_loggers.queue.warn(`${pid} waiting for nothing, treating as terminated`);
            continue;
          }
          if (result.context === undefined) {
            this._kernel_loggers.queue.warn(`${pid} waiting for ${wait_event} with no context, treating as terminated`);
            continue;
          }
          const next_check_time =
            wait_event === TASK.WAIT_EVENT_TYPE.WAIT_TIME
              ? (result.context as TASK.WAIT_TIME_CONTEXT).time
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
          this._kernel_loggers.queue.warn(`${pid} aborted...`, result.context);
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

  /**
   * handles the wait queue {@link _wait_queue} inside of tick
   *
   * @param  {QUEUE_TYPE} queue_type the queue type to handle
   */
  private _handle_wait_queue(queue_type: QUEUE_TYPE) {
    for (const wait_context of this._wait_queue[queue_type]) {
      this._kernel_loggers.pedantic_debugging.debug("wait context:", wait_context);
      if (wait_context.next_check > Game.time) {
        continue;
      }
      switch (wait_context.wait_event) {
        case TASK.WAIT_EVENT_TYPE.WAIT_TIME: {
          // that's already handled by next_check
          this._wait_queue[queue_type].splice(this._wait_queue[queue_type].indexOf(wait_context), 1);
          this._running_queue[queue_type].push(wait_context.pid);
          continue;
        }
        default: {
          this._kernel_loggers.main.warn(`Unhandled wait event type ${wait_context.wait_event}`, wait_context);
        }
      }
    }
  }
}

profiler.registerClass(KERNEL, "KERNEL");
