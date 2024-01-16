import { CACHE } from "utils";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { heap_cache_getter, memory_cache, memory_cache_getter, key_by_id } = CACHE;

/**
 * adds cached properties to sources
 *
 * @class
 */
export class EXTENDED_SOURCE {
  @memory_cache_getter(key_by_id, (i: EXTENDED_SOURCE) => Game.getObjectById(i.id)?.energy)
  public energy!: number;

  @heap_cache_getter((i: EXTENDED_SOURCE) => Game.getObjectById(i.id)?.energyCapacity)
  public energyCapacity!: number;

  @memory_cache(key_by_id)
  public open_spaces?: number;

  @memory_cache_getter(key_by_id, (i: EXTENDED_SOURCE) => Game.getObjectById(i.id)?.pos)
  public pos!: RoomPosition;

  @memory_cache_getter(key_by_id, (i: EXTENDED_SOURCE) => Game.getObjectById(i.id)?.room)
  public room!: Room;

  /**
   * creates an instance of EXTENDED_SOURCE
   *
   * @constructs EXTENDED_SOURCE
   * @param {Id<Source>} id the source id
   */
  public constructor(public id: Id<Source>) {}
}
