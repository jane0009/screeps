import { CONSTANTS, KERNEL } from "system";
import { LOGGING } from "utils";
import { ERROR_MAPPER } from "utils/error_mapper";
import "./extends";
import { loop as minimal_ai } from "./minimal_ai";
import "./utils/client_abuse";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
if (global.client_abuse?.inject_room_tracker) global.client_abuse.inject_room_tracker();
// runs only on reload
global.log_manager = new LOGGING.LOG_MANAGER(CONSTANTS.KERNEL_LOG_LEVEL);
global.performance_log = global.log_manager.get_logger("Performance");
const kernel = new KERNEL();
kernel.init();
global.log_manager.blacklist_all(["Performance", "Kernel_Pedantic"]);

export const loop = ERROR_MAPPER.wrap_loop(() => {
  minimal_ai();
  kernel.tick();
});

// respawn in w8n3

/**
 * GOALS:
 * - use enums for everything possible to minimize memory cost
 * - cache as much as possible, make a custom cache with LRU and TTL - base it off the max amount of memory available
 *   - have reserved memory and undeletable cache objects
 *   - extend main game objects (creep, source, etc.) to use cached memory
 * - task system, each task has an internal priority, list of required body parts and a map of body part to preference (e.g. mining would be [WORK: 3, CARRY: 2, MOVE: 3]), tries to spawn find & assign bots closest to this ratio
 *   - allow negative priorities to discourage a part
 * - creeps keep track of list of TASK SUITABILITY AS NUMBER [0,1], and any task relevant memory
 * - sources have the number of open spaces, a map of creep -> time to depletion
 * - spawns have spawn queue as list of tasks and not list of creeps
 *
 * - cpu limit calculated based on max cpu and bucket
 *
 * - scheduler
 *   - multi level feedback queue
 *   - number of queues, algorithm per queue, upgrade/demote method, method to first determine queue
 *
 * - tasks:
 *   - tasks handle everything, they are the analogue to processes
 *   - priority, game object type it works on
 *   - tasks for e.g. source availability calculation are done as the source
 *   - scheduling considerations:
 *     - active/passive distinction
 *     - priority levels: idle, below normal, normal, above normal, high, realtime
 *     - relative priorities: idle, lowest, below normal, normal, above normal, highest, time critical
 *       - relative priority starts at normal, goes up or down based on age and amount of cpu taken in the past
 *     - load: trivial, low, medium, high, tremendous
 *     - time waiting in queue
 *   - preemption?
 *   - task state: new, running, waiting, ready, terminated
 *   - ready queue, wait queue
 *   - game objects being used by a task are considered its resources
 *   - task exit types, exit() or abort()
 *   - parent => child, pids
 *   - waiting (time based / event based / hybrid?)
 *   - shared memory / ipc
 *
 * - infrastructure state, locks certain tasks from running
 *   - bootstrap, stabilizing, stable, expanding, sprawling
 *   - warring flag
 *
 * - exploration system to find expansion candidates
 * - automated placement of buildings, walls, ramparts, roads
 * - automated upkeep of structures and creeps based on rebuild vs repair cost
 *
 * - misc:
 *   - fancy logging
 *   - voice logging for important messages
 *   - good path candidates & movement code (autobahn)
 *
 * - long-term, sift through the unconverted scripts
 */

/**
 * priorities:
 * --------[name]--------[priority]---[active/passive]---[estimated load]---
 * | scheduler         |  realtime  |      active      |       medium      |
 * |-------------------|------------|------------------|-------------------|
 * | event waiting     |  realtime  |      passive     |       medium      |
 * |-------------------|------------|------------------|-------------------|
 * | mining            |    high    |      active      |       medium      |
 * |-------------------|------------|------------------|-------------------|
 * | defending         |    high    |      active      |        high       |
 * |-------------------|------------|------------------|-------------------|
 * | attacking         |    high    |      active      |    tremendous     |
 * |-------------------|------------|------------------|-------------------|
 * | collect resources |            |                  |                   |
 * | from decayed      |    high    |      passive     |        low        |
 * | objects           |            |                  |                   |
 * |-------------------|------------|------------------|-------------------|
 * | towers            |    high    |      passive     |       medium      |
 * |-------------------|------------|------------------|-------------------|
 * | prevent rcl decay |    high    |      active      |        low        |
 * |-------------------|------------|------------------|-------------------|
 * | building          |   above    |      passive     |        low        |
 * |                   |   normal   |                  |                   |
 * |-------------------|------------|------------------|-------------------|
 * | upgrade to next   |   normal   |      active      |        low        |
 * | rcl               |            |                  |                   |
 * |-------------------|------------|------------------|-------------------|
 * | structure         |   normal   |      passive     |      trivial      |
 * | calculations      |            |                  |                   |
 * |-------------------|------------|------------------|-------------------|
 * | planning          |   below    |      passive     |        high       |
 * |                   |   normal   |                  |                   |
 * |-------------------|------------|------------------|-------------------|
 * | exploring         |    low     |      passive     |       medium      |
 * |-------------------|------------|------------------|-------------------|
 * | visuals           |    low     |      passive     |       medium      |
 * -------------------------------------------------------------------------
 */
