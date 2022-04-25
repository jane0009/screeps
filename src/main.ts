import { ErrorMapper } from "lib/ErrorMapper";
import Process from "os/Process";
// import profiler from "screeps-profiler";
import Inscribe from 'screeps-inscribe';
import Logger from './lib/Logger';
import { Storeable } from './os/Storage';

declare global {

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      Inscribe: any;
      Logger: Logger;
    }
  }
}

// profiler.enable();
global.Inscribe = Inscribe();
global.Logger = new Logger();

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  global.Logger.debug(`Current game tick is ${Game.time}`);
  let s = new Process(0, 0, 0);
  console.log(s.serialize());
});
