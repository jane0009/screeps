import { CACHE } from "utils";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { heap_cache_getter, memory_cache, memory_cache_getter, key_by_id } = CACHE;

/**
 * adds cached properties to spawns
 *
 * @class
 */
export class EXTENDED_SPAWN {
  @memory_cache_getter(key_by_id, (i: EXTENDED_SPAWN) => Game.getObjectById(i.id)?.hits)
  public hits!: number;

  @heap_cache_getter((i: EXTENDED_SPAWN) => Game.getObjectById(i.id)?.hitsMax)
  public hitsMax!: number;

  @memory_cache_getter(key_by_id, (i: EXTENDED_SPAWN) => Game.getObjectById(i.id)?.pos)
  public pos!: RoomPosition;

  @memory_cache_getter(key_by_id, (i: EXTENDED_SPAWN) => Game.getObjectById(i.id)?.room)
  public room!: Room;

  /**
   * creates an instance of EXTENDED_SPAWN
   *
   * @constructs EXTENDED_SPAWN
   * @param {Id<StructureSpawn>} id the spawn id
   */
  public constructor(public id: Id<StructureSpawn>) {}
}
