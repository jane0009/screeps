import Logger from "./lib/Logger";

type ScreepsInscribe = any;

declare global {
  namespace NodeJS {
    interface Global {
      Inscribe: ScreepsInscribe;
      Logger: Logger;
    }
  }
}
