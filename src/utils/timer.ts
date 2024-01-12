declare global {
  namespace NodeJS {
    interface Global {
      timers: {
        callback: CALLBACK_FUNCTION;
        delay: number;
        start: number;
        type: "timeout" | "interval";
      }[];
    }
  }
}

global.timers = [];

export type CALLBACK_FUNCTION = () => void;

/**
 * Emulates setTimeout using Game.time
 *
 * @param {CALLBACK_FUNCTION} callback the function to call
 * @param {number} delay the delay in ticks
 * @returns {number} the timer id
 */
export function SET_TIMEOUT(callback: CALLBACK_FUNCTION, delay: number): number {
  return (
    global.timers.push({
      callback,
      delay,
      start: Game.time,
      type: "timeout"
    }) - 1
  );
}

/**
 * Emulates setInterval using Game.time
 *
 * @param {CALLBACK_FUNCTION} callback the function to call
 * @param {number} delay the delay in ticks
 * @returns {number} the timer id
 */
export function SET_INTERVAL(callback: CALLBACK_FUNCTION, delay: number): number {
  return (
    global.timers.push({
      callback,
      delay,
      start: Game.time,
      type: "interval"
    }) - 1
  );
}

/**
 * Clear timer
 *
 * @param {number} timer_id the timer id
 */
export function CLEAR_TIMER(timer_id: number): void {
  global.timers.splice(timer_id, 1);
}

/**
 * On-tick function to handle timers
 */
export function HANDLE_TIMERS(): void {
  const current_time = Game.time;
  for (let i = global.timers.length - 1; i >= 0; i--) {
    const timer = global.timers[i];
    if (current_time - timer.start >= timer.delay) {
      timer.callback();
      if (timer.type === "timeout") {
        global.timers.splice(i, 1);
      } else {
        timer.start = current_time;
      }
    }
  }
}
