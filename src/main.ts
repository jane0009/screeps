import { ErrorMapper } from "lib/ErrorMapper";
import Inscribe from "screeps-inscribe";
import Logger from "./lib/Logger";
// import Process from "os/Process";

global.Inscribe = Inscribe();
global.Logger = new Logger();

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  global.Logger.debug(`Current game tick is ${Game.time}`);
  // const s = new Process(0, 0, 0);

  // s.junkData(20);

  // const serialized = s.serialize();
  // console.log(serialized);

  // const deserialized = Process.deserialize(serialized);
  // console.log(JSON.stringify(deserialized));
});
