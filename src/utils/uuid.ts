const map = "0123456789ABCDEF".split("");

export type UUID = string;

/**
 * class for generating UUIDs
 *
 * @class
 */
export class UUID_GENERATOR {
  /**
   * gets a UUID for a class or object
   *
   * @param {string} class_name the class or object to get a UUID for
   * @param {number} section_length the length of each section
   * @returns {UUID} the generated UUID
   */
  public static get_class_uuid(class_name: string, section_length = 12): UUID {
    const r1 = class_name;
    const r2 = this.get_rand_str(section_length);
    return `${r1}_${r2}`;
  }

  /**
   * gets a UUID, split into three sections
   *
   * @param {number} section_length the length of each section
   * @param {string} category optionally, set the first section to a given string
   * @returns {UUID} the generated UUID
   */
  public static get_uuid(section_length = 8, category?: string): UUID {
    const t = Game.time;
    const r1 = category || this.get_rand_str(section_length);
    const r2 = this.convolute_timestamp(t, section_length);
    const r3 = this.get_rand_str(section_length);

    return `${r1}_${r2}_${r3}`;
  }
  /**
   * turns the current game tick into a hex string
   *
   * @param {number} time the current game time
   * @param {number} result_length the length of the hex string
   * @returns {string} the hex string
   */
  private static convolute_timestamp(time: number, result_length: number): string {
    // let str = "";
    let num = time.toString(16);
    while (num.length < result_length) {
      num = "0" + num;
    }
    return num.toUpperCase();
    // return str;
  }

  /**
   * gets a randomized string of a given length
   *
   * @param {number} result_length the length of the string
   * @returns {string} the string
   */
  private static get_rand_str(result_length: number): string {
    const r = [];
    for (let i = 0; i < result_length; i++) {
      r.push(map[Math.floor(Math.random() * map.length)]);
    }
    return r.join("");
  }
}
