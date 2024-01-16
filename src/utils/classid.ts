/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { UUID_GENERATOR } from "./uuid";

/**
 * decorator for adding a UUID to a class
 *
 * @param {any} target the class to add the UUID to
 * @param {string} property the property to add the UUID to
 */
export const class_id = (target: any, property: string): void => {
  Object.defineProperty(target, property, {
    get(): string {
      if (!target._id) {
        target._id = UUID_GENERATOR.get_class_uuid(target.constructor.name);
      }
      return target._id;
    },
    set(value: string) {
      target._id = value;
    }
  });
};
