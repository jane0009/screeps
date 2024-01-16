import { KERNEL, TASK } from "system";
import { LOGGING } from "utils";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { key_by_id, lru_cache, memory_cache, ttl_cache } from "utils/cache";

/**
 * test memory caching
 *
 * @class
 */
export class CACHE_TEST_TASK extends TASK.TASK<any> {
  public id = "CACHE_TEST_TASK";

  @memory_cache(key_by_id)
  private _cache?: number;
  private _log: LOGGING.LOG_INTERFACE;

  @lru_cache(key_by_id, 1)
  private _lru_cache?: number;

  @lru_cache(key_by_id, 1)
  private _lru_cache_2?: number;

  @ttl_cache(key_by_id, 20)
  private _ttl_cache?: number;

  /**
   * creates an instance of CACHE_TEST_TASK
   *
   * @constructs CACHE_TEST_TASK
   * @param {TASK.TASK_CONTEXT} context the task context
   * @param {KERNEL} kernel the kernel instance
   */
  public constructor(context: TASK.TASK_CONTEXT, kernel: KERNEL) {
    super(context, kernel);
    this._log = this._kernel.log_manager.get_logger(`CacheTest`);
  }

  /**
   * See {@link TASK.inherent_priority}
   *
   * @returns {TASK.TASK_PRIORITY} idle priority
   */
  public get inherent_priority(): TASK.TASK_PRIORITY {
    return TASK.TASK_PRIORITY.IDLE;
  }

  /**
   * See {@link TASK.active}
   *
   * @returns {boolean} false
   */
  public get active(): boolean {
    return false;
  }

  /**
   * See {@link TASK.estimated_impact}
   *
   * @returns {number} 5
   */
  public get estimated_impact(): number {
    return 5;
  }

  /**
   * See {@link TASK.recalculate_assigned}
   *
   * @returns {ASSIGN_INVALIDATE_FUNCTION<any>} function to invalidate assigned rooms
   */
  public recalculate_assigned(): TASK.ASSIGN_INVALIDATE_FUNCTION<any> {
    return () => false;
  }

  /**
   * See {@link TASK.run}
   *
   * @returns {TASK.TASK_RETURN} return type
   */
  public run(): TASK.TASK_RETURN {
    this._cache ??= 0;
    this._cache++;
    if (this._cache >= 100) {
      this._log.info(`_cache hit 100, reset`);
      this._cache = 0;
    }
    if (!this._ttl_cache) {
      this._log.info(`_ttl_cache was undefined, set to 100`);
      this._ttl_cache = 100;
    }
    if (!this._lru_cache) {
      this._log.info(`_lru_cache was undefined, set to 100`);
      this._lru_cache = 100;
    }
    if (!this._lru_cache_2) {
      this._log.info(`_lru_cache_2 was undefined, set to 100`);
      this._lru_cache_2 = 100;
    }
    return {
      return_type: TASK.TASK_RETURN_TYPE.CONTINUE
    };
  }
}
