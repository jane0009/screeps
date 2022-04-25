import { DIRECTION_TO_OFFSET, OFFSET_TO_DIRECTION } from '../constants/index';

PathFinder.CostMatrix.prototype.setFast = function (x: number, y: number, value: any) {
  this._bits[x * 50 + y] = value;
};

interface TinyPos {
  x: number,
  y: number
};

export const Utils = {

  hasActiveBodyparts(creep: Creep, partType: BodyPartConstant) {
    const body = creep.body;
    for (let i = body.length - 1; i >= 0; i--) {
      const part = body[i];
      if (part.hits <= 0) {
        break;
      }
      if (part.type === partType) {
        return true;
      }
    }
    return false;
  },

  logError(error: Error) {
    return global.Logger.error(`ERROR: ${error.name}, MESSAGE: ${error.message}.\nSTACK: ${error.stack}`);
  },

  getRange(pos1: TinyPos, pos2: TinyPos) {
    return Math.max(Math.abs(pos1.x - pos2.x), Math.abs(pos1.y - pos2.y));
  },

  posToCoords(pos: TinyPos) {
    return { x: pos.x, y: pos.y };
  },

  offsetPosCoords(pos: TinyPos, direction: number) {
    const x = pos.x + (DIRECTION_TO_OFFSET[direction * 2] || 0);
    const y = pos.y + (DIRECTION_TO_OFFSET[direction * 2 + 1] || 0);
    return { x, y };
  },

  offsetPos(pos: RoomPosition, direction: number) {
    const offsetX = DIRECTION_TO_OFFSET[direction * 2] || 0;
    const offsetY = DIRECTION_TO_OFFSET[direction * 2 + 1] || 0;
    return new RoomPosition(pos.x + offsetX, pos.y + offsetY, pos.roomName);
  },

  isPosEqual(pos1: RoomPosition, pos2: RoomPosition) {
    return (
      pos1.x === pos2.x &&
      pos1.y === pos2.y &&
      pos1.roomName === pos2.roomName
    );
  },

  getDirection(pos1: TinyPos, pos2: TinyPos) {
    const dx = pos2.x - pos1.x + 1;
    const dy = pos2.y - pos1.y + 1;
    return OFFSET_TO_DIRECTION[dy * 3 + dx] || 0;
  },

  isPosExit(pos: TinyPos) {
    const { x, y } = pos;
    return x <= 0 || y <= 0 || x >= 49 || y >= 49;
  },

  isCoordsEqual(pos1: TinyPos, pos2: TinyPos) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  },

  lookInRange(pos: TinyPos, room: Room, look: LookConstant, range: number) {
    const { x, y } = pos;
    const minX = Math.max(x - range, 0);
    const minY = Math.max(y - range, 0);
    const maxX = Math.min(x + range, 49);
    const maxY = Math.min(y + range, 49);
    return room.lookForAtArea(look, minY, minX, maxY, maxX, true);
  },

};
