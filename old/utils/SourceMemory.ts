import { memoryCacheGetter, keyById, memoryCache } from "screeps-cache";

export default class SourceMemory {
  constructor(public id: Id<Source>) { }

  @memoryCacheGetter(keyById, (i: SourceMemory) => Game.getObjectById(i.id)?.pos)
  public pos?: RoomPosition

  @memoryCache(keyById)
  public free_spaces: number = -1;

  get_available_spaces(): number {
    if (this.free_spaces != -1) {
      return this.free_spaces;
    }
    else {
      let source = Game.getObjectById(this.id);
      let around = [
        { x: -1, y: -1 },
        { x: -1, y: 0 },
        { x: -1, y: 1 },
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: 1, y: -1 },
        { x: 1, y: 0 },
        { x: 1, y: 1 }
      ];
      let availableSides = 0;
      if (source != null) {
        let pos = source.pos;
        for (let coords of around) {
          let result = source.room.lookAt(pos.x + coords.x, pos.y + coords.y);
          let terrain = result.filter(
            (val) => val.type == LOOK_TERRAIN
          )[0];
          if (terrain.terrain != "wall") {
            availableSides++;
          }
        }
        this.free_spaces = availableSides;
        return this.free_spaces;
      }
      return 0;
    }
  }

  get_free_spaces(): number {
    let source = Game.getObjectById(this.id);
    let around = [
      { x: -1, y: -1 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: 1, y: -1 },
      { x: 1, y: 0 },
      { x: 1, y: 1 }
    ];
    let availableSides = 0;
    if (source != null) {
      let pos = source.pos;
      for (let coords of around) {
        let result = source.room.lookAt(pos.x + coords.x, pos.y + coords.y);
        let terrain = result.filter(
          (val) => val.type == LOOK_TERRAIN
        )[0];
        let creeps = result.filter(
          (val) => val.type == LOOK_CREEPS
        )[0];
        if (terrain.terrain != "wall" && creeps.creep != undefined) {
          availableSides++;
        }
      }
      this.free_spaces = availableSides;
      return this.free_spaces;
    }
    return 0;
  }
}
