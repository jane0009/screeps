const map = "0123456789ABCDEF".split("");

export type UUID = string;

function convolute_timestamp(n: number, l: number): string {
  // let str = "";
  let num = n.toString(16);
  while (num.length < l) {
    num = "0" + num;
  }
  return num.toUpperCase();
  // return str;
}

function get_rand_str(n: number): string {
  const r = [];
  for (let i = 0; i < n; i++) {
    r.push(map[Math.floor(Math.random() * map.length)]);
  }
  return r.join("");
}

export function get_uuid(n = 8, category: string | undefined = undefined): UUID {
  const t = Game.time;
  const r1 = category || get_rand_str(n);
  const r2 = convolute_timestamp(t, n);
  const r3 = get_rand_str(n);

  return `${r1}-${r2}-${r3}`;
}
