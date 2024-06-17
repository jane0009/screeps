import { KERNEL } from "system";
import { CACHE_TEST_TASK } from "./cache_test";
import { SOURCE_UPKEEP_TASK } from "./sources";
import { SPAWN_HANDLER_TASK } from "./spawns";
import { ROOM_VISUAL_MANAGER_TASK } from "./visual";

export * from "./test";
export * from "./visual";

// TODO: find a better way to queue tasks for spawning
/**
 * inserts all tasks into the scheduler
 * currently for testing, may be removed
 *
 * @param {KERNEL} kernel the kernel instance
 */
export const INSERT_ALL_TASKS = (kernel: KERNEL): void => {
  const scheduler = kernel.scheduler;
  scheduler.register_task(CACHE_TEST_TASK);
  scheduler.register_task(ROOM_VISUAL_MANAGER_TASK);
  scheduler.register_task(SOURCE_UPKEEP_TASK);
  scheduler.register_task(SPAWN_HANDLER_TASK);
};
