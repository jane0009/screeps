export const colors = {
  darker: "#140a0a",
  dark: "#232323",
  less_dark: "#302a2a",
  gray: "#555",
  light_gray: "#aaa",
  outline: "#ba8db6",
  speech_text: "#000",
  speech_background: "#2bcf8d",
  road: "#666",
  energy: "#ffe56d",
  power: "#f24848"
};

const text_size = 0.35;
const text_font = "Courier New";

// helper functions
/**
 * calculates the gaps for the factory structure
 *
 * @returns {number[][]} the gaps for the factory structure
 */
const calculate_factory_gaps = () => {
  let x = -0.08;
  let y = -0.52;
  const result = [];

  const angle = 16 * (Math.PI / 180);
  const c1 = Math.cos(angle);
  const s1 = Math.sin(angle);

  const angle2 = 72 * (Math.PI / 180);
  const c2 = Math.cos(angle2);
  const s2 = Math.sin(angle2);

  for (let i = 0; i < 5; ++i) {
    result.push([0.0, 0.0]);
    result.push([x, y]);
    result.push([x * c1 - y * s1, x * s1 + y * c1]);
    const tx = x * c2 - y * s2;
    y = x * s2 + y * c2;
    x = tx;
  }

  return result;
};
const factory_gaps = calculate_factory_gaps();

// prototypes

declare global {
  interface RoomVisual {
    structure: (
      x: number,
      y: number,
      type: BuildableStructureConstant,
      opts?: {
        [key: string]: any;
        opacity?: number;
      }
    ) => RoomVisual | void;
  }
}

RoomVisual.prototype.structure = function (
  x: number,
  y: number,
  type: BuildableStructureConstant,
  opts?: {
    [key: string]: any;
    opacity?: number;
  }
): RoomVisual | void {
  const opacity = opts?.opacity ?? 1;
  switch (type) {
    case STRUCTURE_FACTORY: {
      const outline = [
        [-0.68, -0.11],
        [-0.84, -0.18],
        [-0.84, -0.32],
        [-0.44, -0.44],
        [-0.32, -0.84],
        [-0.18, -0.84],
        [-0.11, -0.68],

        [0.11, -0.68],
        [0.18, -0.84],
        [0.32, -0.84],
        [0.44, -0.44],
        [0.84, -0.32],
        [0.84, -0.18],
        [0.68, -0.11],

        [0.68, 0.11],
        [0.84, 0.18],
        [0.84, 0.32],
        [0.44, 0.44],
        [0.32, 0.84],
        [0.18, 0.84],
        [0.11, 0.68],

        [-0.11, 0.68],
        [-0.18, 0.84],
        [-0.32, 0.84],
        [-0.44, 0.44],
        [-0.84, 0.32],
        [-0.84, 0.18],
        [-0.68, 0.11]
      ];
      this.poly(
        outline.map((p) => [p[0] + x, p[1] + y]),
        {
          stroke: colors.outline,
          strokeWidth: 0.05,
          opacity
        }
      );
      this.circle(x, y, {
        radius: 0.65,
        fill: colors.dark,
        strokeWidth: 0.035,
        stroke: colors.darker,
        opacity
      });
      const spikes = [
        [-0.4, -0.1],
        [-0.8, -0.2],
        [-0.8, -0.3],
        [-0.4, -0.4],
        [-0.3, -0.8],
        [-0.2, -0.8],
        [-0.1, -0.4],

        [0.1, -0.4],
        [0.2, -0.8],
        [0.3, -0.8],
        [0.4, -0.4],
        [0.8, -0.3],
        [0.8, -0.2],
        [0.4, -0.1],

        [0.4, 0.1],
        [0.8, 0.2],
        [0.8, 0.3],
        [0.4, 0.4],
        [0.3, 0.8],
        [0.2, 0.8],
        [0.1, 0.4],

        [-0.1, 0.4],
        [-0.2, 0.8],
        [-0.3, 0.8],
        [-0.4, 0.4],
        [-0.8, 0.3],
        [-0.8, 0.2],
        [-0.4, 0.1]
      ];
      this.poly(
        spikes.map((p) => [p[0] + x, p[1] + y]),
        {
          fill: colors.gray,
          stroke: colors.darker,
          strokeWidth: 0.03,
          opacity
        }
      );
      this.circle(x, y, {
        radius: 0.54,
        fill: colors.less_dark,
        strokeWidth: 0.04,
        stroke: colors.darker,
        opacity
      });
      this.poly(
        factory_gaps.map((p) => [p[0] + x, p[1] + y]),
        {
          fill: colors.darker,
          opacity
        }
      );
      this.circle(x, y, {
        radius: 0.42,
        fill: colors.darker,
        opacity
      });
      this.rect(x - 0.24, y - 0.24, 0.48, 0.48, {
        fill: colors.less_dark,
        opacity
      });
      break;
    }
    case STRUCTURE_EXTENSION: {
      this.circle(x, y, {
        radius: 0.5,
        fill: colors.dark,
        stroke: colors.outline,
        strokeWidth: 0.05,
        opacity
      });
      this.circle(x, y, {
        radius: 0.35,
        fill: colors.gray,
        opacity
      });
      break;
    }
    case STRUCTURE_SPAWN: {
      this.circle(x, y, {
        radius: 0.65,
        fill: colors.dark,
        stroke: colors.light_gray,
        strokeWidth: 0.1,
        opacity
      });
      this.circle(x, y, {
        radius: 0.4,
        fill: colors.energy,
        opacity
      });
      break;
    }
    case STRUCTURE_POWER_SPAWN: {
      break;
    }
    case STRUCTURE_LINK: {
      break;
    }
    case STRUCTURE_TERMINAL: {
      break;
    }
    case STRUCTURE_LAB: {
      break;
    }
    case STRUCTURE_TOWER: {
      break;
    }
    case STRUCTURE_ROAD: {
      break;
    }
    case STRUCTURE_RAMPART: {
      break;
    }
    case STRUCTURE_WALL: {
      break;
    }
    case STRUCTURE_STORAGE: {
      break;
    }
    case STRUCTURE_OBSERVER: {
      break;
    }
    case STRUCTURE_NUKER: {
      break;
    }
    case STRUCTURE_CONTAINER: {
      break;
    }
    default: {
      this.circle(x, y, {
        fill: colors.light_gray,
        radius: 0.35,
        stroke: colors.dark,
        strokeWidth: 0.2,
        opacity
      });
    }
  }

  return this;
};
