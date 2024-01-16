/**
 * Extends the Room class
 * needed because tasks cache values but not functions
 *
 * @class
 */
export class EXTENDED_ROOM {
  public id: string;
  public name: string;

  /**
   * See {@link Room.visual}
   *
   * @returns {RoomVisual} the room visual
   */
  public get visual(): RoomVisual {
    return Game.rooms[this.id].visual ?? new RoomVisual(this.id);
  }

  /**
   * creates an instance of EXTENDED_ROOM
   *
   * @constructs EXTENDED_ROOM
   * @param {Room} room the room to extend
   */
  public constructor(public room: Room) {
    this.id = this.name = room.name;
  }
}
