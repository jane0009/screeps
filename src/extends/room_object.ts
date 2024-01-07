/* eslint-disable snakecasejs/snakecasejs */
export {};

declare global {
  interface RoomObject {
    look_for_near: (look_for: any, as_array: any, range?: number) => any;
  }
}

RoomObject.prototype.look_for_near = function (look_for: any, as_array: any, range = 0) {
  const { x, y } = this.pos;
  return this.room?.lookForAtArea(
    look_for,
    Math.max(0, y - range),
    Math.max(0, x - range),
    Math.min(49, y + range),
    Math.min(49, x + range),
    as_array
  );
};
