import { KERNEL } from "system";
import { TEST_TASK } from "./test";
import { ROOM_VISUAL_MANAGER_TASK } from "./visual";

export * from "./test";
export * from "./visual";

/**
 * inserts all tasks into the scheduler
 * currently for testing, may be removed
 *
 * @param {KERNEL} kernel the kernel instance
 */
export const INSERT_ALL_TASKS = (kernel: KERNEL): void => {
  const scheduler = kernel.scheduler;
  scheduler.wants_spawn(TEST_TASK);
  scheduler.wants_spawn(ROOM_VISUAL_MANAGER_TASK);
};
