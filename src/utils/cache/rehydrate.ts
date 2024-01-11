/* eslint-disable snakecasejs/snakecasejs */
export type Rehydrater = (data: any) => unknown;

/**
 * default rehydrater
 *
 * @param {any} d the data to rehydrate
 * @returns {any} the rehydrated data
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/explicit-module-boundary-types
export const default_rehydrater = (d: any): any => d;

/**
 * rehydrates position data into a RoomPosition object
 *
 * @param {pos} pos the position data to rehydrate
 * @returns {RoomPosition} the rehydrated position
 */
export const as_room_position = (pos: { name: string; x: number; y: number } | undefined): RoomPosition | undefined => {
  if (!pos) {
    return undefined;
  }
  return new RoomPosition(pos.x, pos.y, pos.name);
};
