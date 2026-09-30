globalThis.ProgressEvent = class ProgressEvent {}; globalThis.Worker = class Worker { constructor() {} postMessage() {} terminate() {} }

// scripts/sanity-entry.ts
import { readFileSync } from "node:fs";
import { GLTFLoader } from "three-stdlib";
import { DRACOLoader } from "three-stdlib";

// src/motion/buildClip.ts
import {
  AnimationClip,
  AnimationMixer,
  Euler,
  Quaternion,
  QuaternionKeyframeTrack,
  Vector3,
  VectorKeyframeTrack
} from "three";

// src/motion/motions.ts
var mirror = (e) => [e[0], -e[1], -e[2]];
function both(partial) {
  const rot = {};
  for (const [name, e] of Object.entries(partial)) {
    rot[name] = e;
    if (name.startsWith("Left")) {
      const right = "Right" + name.slice(4);
      if (!Object.prototype.hasOwnProperty.call(partial, right)) rot[right] = mirror(e);
    }
  }
  return rot;
}
var merge = (...parts) => Object.assign({}, ...parts);
var pose = (t, rot, extra) => ({ t, rot, ...extra });
var STAND = both({
  LeftArm: [14, 8, -73],
  LeftForeArm: [0, -14, 0],
  LeftUpLeg: [-3, 0, 3],
  LeftLeg: [5, 0, 0],
  Spine: [2, 0, 0]
});
var SQUAT = both({
  LeftUpLeg: [-86, 8, 12],
  LeftLeg: [112, 0, 0],
  LeftFoot: [-24, 0, 0],
  Spine: [26, 0, 0],
  Spine1: [8, 0, 0],
  LeftArm: [52, 22, -52],
  LeftForeArm: [0, -52, 0]
});
var HINGE = both({
  LeftUpLeg: [-70, 2, 4],
  LeftLeg: [18, 0, 0],
  LeftFoot: [-8, 0, 0],
  Spine: [50, 0, 0],
  Spine1: [16, 0, 0],
  LeftArm: [10, 4, -78],
  LeftForeArm: [0, -8, 0]
});
var KB_HIKE = both({
  LeftUpLeg: [-56, 8, 10],
  LeftLeg: [34, 0, 0],
  LeftFoot: [-10, 0, 0],
  Spine: [20, 0, 0],
  Spine1: [6, 0, 0],
  LeftArm: [8, 0, -96],
  LeftForeArm: [0, -6, 0]
});
var KB_TOP = both({
  LeftUpLeg: [-2, 0, 2],
  LeftLeg: [6, 0, 0],
  Spine: [2, 0, 0],
  LeftArm: [-72, 0, -96],
  LeftForeArm: [0, -8, 0]
});
var DEADLIFT_BOTTOM = both({
  LeftUpLeg: [-76, 4, 6],
  LeftLeg: [52, 0, 0],
  LeftFoot: [-14, 0, 0],
  Spine: [38, 0, 0],
  Spine1: [16, 0, 0],
  LeftArm: [16, 4, -78],
  LeftForeArm: [0, -8, 0]
});
var RACK = both({
  LeftArm: [-40, 0, -80],
  LeftForeArm: [0, -48, 0],
  LeftUpLeg: [-3, 0, 3],
  LeftLeg: [5, 0, 0],
  Spine: [4, 0, 0]
});
var OVERHEAD = both({
  LeftArm: [60, 100, 40],
  LeftForeArm: [0, -12, 0],
  LeftUpLeg: [-3, 0, 3],
  LeftLeg: [4, 0, 0],
  Spine: [4, 0, 0]
});
var TUCK = both({
  LeftUpLeg: [-16, 4, 4],
  LeftLeg: [70, 0, 0],
  LeftFoot: [-12, 0, 0]
});
var FLOOR = {
  hips: [0, 8, 6],
  hipsRot: [-90, 0, 0]
};
var SUPINE_LEGS = both({
  LeftUpLeg: [-32, 10, 6],
  LeftLeg: [74, 0, 0],
  LeftFoot: [6, 0, 0]
});
var LUNGE_LEFT = {
  LeftUpLeg: [-80, 4, 6],
  RightUpLeg: [-10, -4, -6],
  LeftLeg: [100, 0, 0],
  RightLeg: [90, 0, 0],
  LeftFoot: [-4, 0, 0],
  RightFoot: [12, 0, 0],
  Spine: [8, 0, 0],
  Spine1: [4, 0, 0],
  LeftArm: [16, 6, -68],
  RightArm: [16, -6, 68],
  LeftForeArm: [0, -16, 0],
  RightForeArm: [0, 16, 0]
};
var LUNGE_RIGHT = {
  RightUpLeg: [-80, -4, -6],
  LeftUpLeg: [-10, 4, 6],
  RightLeg: [100, 0, 0],
  LeftLeg: [90, 0, 0],
  RightFoot: [-4, 0, 0],
  LeftFoot: [12, 0, 0],
  Spine: [8, 0, 0],
  Spine1: [4, 0, 0],
  RightArm: [16, -6, 68],
  LeftArm: [16, 6, -68],
  RightForeArm: [0, 16, 0],
  LeftForeArm: [0, -16, 0]
};
var HIGH_KNEE_LEFT = {
  LeftUpLeg: [-92, 6, 6],
  LeftLeg: [100, 0, 0],
  RightUpLeg: [4, -2, -3],
  RightLeg: [12, 0, 0],
  LeftFoot: [-8, 0, 0],
  Spine: [6, 0, 0],
  LeftArm: [24, 12, -58],
  RightArm: [-78, 12, 70],
  LeftForeArm: [0, -20, 0],
  RightForeArm: [0, 18, 0]
};
var HIGH_KNEE_RIGHT = {
  RightUpLeg: [-92, -6, -6],
  RightLeg: [100, 0, 0],
  LeftUpLeg: [4, 2, 3],
  LeftLeg: [12, 0, 0],
  RightFoot: [-8, 0, 0],
  Spine: [6, 0, 0],
  RightArm: [24, -12, 58],
  LeftArm: [-78, -12, -70],
  RightForeArm: [0, 20, 0],
  LeftForeArm: [0, -18, 0]
};
var PRONE = {
  hips: [0, 8, -2],
  hipsRot: [90, 0, 0]
};
var PRONE_LEGS = both({ LeftUpLeg: [0, 2, 2], LeftLeg: [4, 0, 0], LeftFoot: [10, 0, 0] });
var GLUTE_BRIDGE_DOWN = merge(
  SUPINE_LEGS,
  both({
    LeftArm: [12, 6, -42],
    LeftForeArm: [0, -10, 0],
    Spine: [4, 0, 0]
  })
);
var GLUTE_BRIDGE_TOP = merge(
  SUPINE_LEGS,
  both({
    LeftUpLeg: [-52, 10, 6],
    LeftLeg: [58, 0, 0],
    LeftFoot: [-4, 0, 0],
    Spine: [-12, 0, 0],
    Spine1: [-6, 0, 0],
    LeftArm: [12, 6, -42],
    LeftForeArm: [0, -10, 0]
  })
);
var SIDE_PLANK_ROT = {
  RightArm: [8, -52, 42],
  RightForeArm: [0, -78, 0],
  LeftArm: [-52, -12, -18],
  LeftForeArm: [0, -8, 0],
  LeftUpLeg: [0, 4, 4],
  RightUpLeg: [0, 4, 4],
  LeftLeg: [4, 0, 0],
  RightLeg: [4, 0, 0],
  LeftFoot: [8, 0, 0],
  RightFoot: [8, 0, 0],
  Spine: [2, 0, 0],
  Spine1: [2, 0, 0]
};
var SIDE_PLANK = {
  hips: [0, 10, 4],
  hipsRot: [0, 0, -90]
};
var MOUNTAIN_CLIMBER_LEFT = merge(
  PRONE_LEGS,
  both({ LeftArm: [0, -84, -6], LeftForeArm: [0, 0, -6], Spine: [2, 0, 0] }),
  {
    LeftUpLeg: [-92, 4, 4],
    LeftLeg: [108, 0, 0],
    LeftFoot: [-12, 0, 0],
    RightUpLeg: [4, -2, -3],
    RightLeg: [8, 0, 0],
    RightFoot: [14, 0, 0]
  }
);
var MOUNTAIN_CLIMBER_RIGHT = merge(
  PRONE_LEGS,
  both({ LeftArm: [0, -84, -6], LeftForeArm: [0, 0, -6], Spine: [2, 0, 0] }),
  {
    RightUpLeg: [-92, -4, -4],
    RightLeg: [108, 0, 0],
    RightFoot: [-12, 0, 0],
    LeftUpLeg: [4, 2, 3],
    LeftLeg: [8, 0, 0],
    LeftFoot: [14, 0, 0]
  }
);
var DIAMOND_TOP = merge(PRONE_LEGS, both({ LeftArm: [0, -58, -10], LeftForeArm: [0, 0, -8], Spine: [2, 0, 0] }));
var DIAMOND_BOTTOM = merge(PRONE_LEGS, both({ LeftArm: [0, -58, -10], LeftForeArm: [0, 0, -96], Spine: [2, 0, 0] }));
var SUPERMAN_DOWN = merge(
  PRONE_LEGS,
  both({
    LeftArm: [62, 0, -12],
    LeftForeArm: [0, -6, 0],
    Spine: [2, 0, 0],
    Head: [4, 0, 0]
  })
);
var SUPERMAN_UP = merge(
  PRONE_LEGS,
  both({
    LeftUpLeg: [-16, 2, 2],
    LeftLeg: [6, 0, 0],
    LeftFoot: [16, 0, 0],
    LeftArm: [68, 0, -10],
    LeftForeArm: [0, -4, 0],
    Spine: [-20, 0, 0],
    Spine1: [-10, 0, 0],
    Head: [-10, 0, 0]
  })
);
var SIDE_LUNGE_LEFT = {
  LeftUpLeg: [-82, 8, 16],
  LeftLeg: [104, 0, 0],
  LeftFoot: [-18, 0, 0],
  RightUpLeg: [4, -4, -22],
  RightLeg: [6, 0, 0],
  RightFoot: [12, 0, 0],
  Spine: [16, 0, 0],
  Spine1: [6, 0, 0],
  LeftArm: [22, 10, -62],
  RightArm: [22, -10, 62],
  LeftForeArm: [0, -22, 0],
  RightForeArm: [0, 22, 0]
};
var SIDE_LUNGE_RIGHT = {
  RightUpLeg: [-82, -8, -16],
  RightLeg: [104, 0, 0],
  RightFoot: [-18, 0, 0],
  LeftUpLeg: [4, 4, 22],
  LeftLeg: [6, 0, 0],
  LeftFoot: [12, 0, 0],
  Spine: [16, 0, 0],
  Spine1: [6, 0, 0],
  RightArm: [22, -10, 62],
  LeftArm: [22, 10, -62],
  RightForeArm: [0, 22, 0],
  LeftForeArm: [0, -22, 0]
};
var SQUAT_VALGUS = both({
  LeftUpLeg: [-86, -26, -12],
  LeftLeg: [112, -10, -6],
  LeftFoot: [-24, 0, 0],
  Spine: [26, 0, 0],
  Spine1: [8, 0, 0],
  LeftArm: [52, 22, -52],
  LeftForeArm: [0, -52, 0]
});
var PUSHUP_TOP = merge(PRONE_LEGS, both({ LeftArm: [0, -84, -6], LeftForeArm: [0, 0, -6], Spine: [2, 0, 0] }));
var PUSHUP_BOTTOM = merge(PRONE_LEGS, both({ LeftArm: [0, -84, -6], LeftForeArm: [0, 0, -92], Spine: [2, 0, 0] }));
var PUSHUP_SAG = merge(PRONE_LEGS, both({ LeftArm: [0, -84, -6], LeftForeArm: [0, 0, -6], Spine: [20, 0, 0], Spine1: [12, 0, 0] }));
var PUSHUP_SAG_BOTTOM = merge(PRONE_LEGS, both({ LeftArm: [0, -84, -6], LeftForeArm: [0, 0, -92], Spine: [20, 0, 0], Spine1: [12, 0, 0] }));
var DEADLIFT_ARCH = both({
  LeftUpLeg: [-76, 4, 6],
  LeftLeg: [52, 0, 0],
  LeftFoot: [-14, 0, 0],
  Spine: [54, 0, 0],
  Spine1: [26, 0, 0],
  Neck: [18, 0, 0],
  Head: [20, 0, 0],
  LeftArm: [16, 4, -78],
  LeftForeArm: [0, -8, 0]
});
var DEADLIFT_HYPER = merge(STAND, both({ Spine: [-16, 0, 0], Spine1: [-10, 0, 0], Head: [-8, 0, 0] }));
var GM_ARCH = merge(
  HINGE,
  both({
    Spine: [64, 0, 0],
    Spine1: [26, 0, 0],
    Neck: [22, 0, 0],
    Head: [18, 0, 0],
    LeftUpLeg: [-62, 2, 3],
    LeftLeg: [14, 0, 0],
    LeftArm: [-80, -40, 40],
    LeftForeArm: [0, -86, 0]
  })
);
var MOTIONS = {
  // ---------- 对比模式：标准动作（供双画布"标准"侧） ----------
  squat: {
    duration: 2.6,
    plant: "feet",
    poses: [pose(0, STAND), pose(1.05, SQUAT), pose(1.4, SQUAT), pose(2.6, STAND)]
  },
  "push-up": {
    duration: 2.2,
    plant: "hands",
    poses: [
      pose(0, PUSHUP_TOP, PRONE),
      pose(0.85, PUSHUP_BOTTOM, PRONE),
      pose(1.2, PUSHUP_BOTTOM, PRONE),
      pose(2.2, PUSHUP_TOP, PRONE)
    ]
  },
  plank: {
    duration: 1.6,
    plant: "hands",
    poses: [pose(0, PUSHUP_TOP, PRONE), pose(1.6, PUSHUP_TOP, PRONE)]
  },
  // ---------- 对比模式：常见错误变体 ----------
  "squat-x-valgus": {
    duration: 2.6,
    plant: "feet",
    poses: [pose(0, STAND), pose(1.05, SQUAT_VALGUS), pose(1.4, SQUAT_VALGUS), pose(2.6, STAND)]
  },
  "push-up-x-sag": {
    duration: 2.2,
    plant: "hands",
    poses: [
      pose(0, PUSHUP_SAG, PRONE),
      pose(0.85, PUSHUP_SAG_BOTTOM, PRONE),
      pose(1.2, PUSHUP_SAG_BOTTOM, PRONE),
      pose(2.2, PUSHUP_SAG, PRONE)
    ]
  },
  "plank-x-sag": {
    duration: 1.6,
    plant: "hands",
    poses: [pose(0, PUSHUP_SAG, PRONE), pose(1.6, PUSHUP_SAG, PRONE)]
  },
  "deadlift-x-arch": {
    duration: 2.6,
    plant: "feet",
    poses: [pose(0, STAND), pose(1.05, DEADLIFT_ARCH), pose(1.4, DEADLIFT_ARCH), pose(2.6, STAND)]
  },
  "deadlift-x-hyper": {
    duration: 2.6,
    plant: "feet",
    poses: [
      pose(0, STAND),
      pose(1.05, DEADLIFT_BOTTOM),
      pose(1.4, DEADLIFT_BOTTOM),
      pose(2.1, DEADLIFT_HYPER),
      pose(2.6, DEADLIFT_HYPER)
    ]
  },
  "bicep-curl-x-swing": {
    duration: 2.2,
    plant: "feet",
    poses: [
      pose(0, STAND),
      // 先向后仰蓄力
      pose(0.4, merge(STAND, both({ Spine: [-12, 0, 0], LeftForeArm: [0, -40, 0] }))),
      // 甩身前倾借力把哑铃"荡"起来
      pose(0.8, merge(STAND, both({ Spine: [20, 0, 0], Spine1: [8, 0, 0], LeftForeArm: [0, -142, 0] }))),
      pose(1.15, merge(STAND, both({ Spine: [16, 0, 0], LeftForeArm: [0, -142, 0] }))),
      pose(2.2, STAND)
    ]
  },
  "bench-press-x-flare": {
    duration: 2.4,
    plant: "none",
    poses: [
      pose(0, merge(SUPINE_LEGS, both({ LeftArm: [-60, -30, -60], LeftForeArm: [0, -125, 0] })), FLOOR),
      // 底部上臂完全外展成 90°（T 位），肘部压力剧增
      pose(0.85, merge(SUPINE_LEGS, both({ LeftArm: [-14, -70, -26], LeftForeArm: [0, -20, 0] })), FLOOR),
      pose(1.2, merge(SUPINE_LEGS, both({ LeftArm: [-14, -70, -26], LeftForeArm: [0, -20, 0] })), FLOOR),
      pose(2.4, merge(SUPINE_LEGS, both({ LeftArm: [-60, -30, -60], LeftForeArm: [0, -125, 0] })), FLOOR)
    ]
  },
  "good-morning-x-arch": {
    duration: 2.6,
    plant: "feet",
    poses: [
      pose(0, merge(STAND, both({ LeftArm: [-80, -40, 40], LeftForeArm: [0, -86, 0] }))),
      pose(1.1, GM_ARCH),
      pose(1.45, GM_ARCH),
      pose(2.6, merge(STAND, both({ LeftArm: [-80, -40, 40], LeftForeArm: [0, -86, 0] })))
    ]
  },
  // ---------- 原有动作 ----------
  deadlift: {
    duration: 2.6,
    plant: "feet",
    poses: [
      pose(0, STAND),
      pose(1.05, DEADLIFT_BOTTOM),
      pose(1.4, DEADLIFT_BOTTOM),
      pose(2.6, STAND)
    ]
  },
  "romanian-deadlift": {
    duration: 2.6,
    plant: "feet",
    poses: [pose(0, STAND), pose(1.1, HINGE), pose(1.45, HINGE), pose(2.6, STAND)]
  },
  lunge: {
    duration: 3.2,
    plant: "feet",
    poses: [
      pose(0, STAND),
      pose(0.7, LUNGE_LEFT),
      pose(1.05, LUNGE_LEFT),
      pose(1.6, STAND),
      pose(2.3, LUNGE_RIGHT),
      pose(2.65, LUNGE_RIGHT),
      pose(3.2, STAND)
    ]
  },
  "bicep-curl": {
    duration: 2.2,
    plant: "feet",
    poses: [
      pose(0, STAND),
      pose(0.8, merge(STAND, both({ LeftForeArm: [0, -142, 0] }))),
      pose(1.15, merge(STAND, both({ LeftForeArm: [0, -142, 0] }))),
      pose(2.2, STAND)
    ]
  },
  "overhead-press": {
    duration: 2.4,
    plant: "feet",
    poses: [pose(0, RACK), pose(0.9, OVERHEAD), pose(1.25, OVERHEAD), pose(2.4, RACK)]
  },
  "lateral-raise": {
    duration: 2.2,
    plant: "feet",
    poses: [
      pose(0, STAND),
      pose(0.8, merge(STAND, both({ LeftArm: [0, 0, -12], LeftForeArm: [0, -8, 0] }))),
      pose(1.15, merge(STAND, both({ LeftArm: [0, 0, -12], LeftForeArm: [0, -8, 0] }))),
      pose(2.2, STAND)
    ]
  },
  "front-raise": {
    duration: 2.2,
    plant: "feet",
    poses: [
      pose(0, STAND),
      pose(0.8, merge(STAND, both({ LeftArm: [-80, -16, -78], LeftForeArm: [0, -10, 0] }))),
      pose(1.15, merge(STAND, both({ LeftArm: [-80, -16, -78], LeftForeArm: [0, -10, 0] }))),
      pose(2.2, STAND)
    ]
  },
  "bent-over-row": {
    duration: 2.4,
    plant: "feet",
    poses: [
      pose(0, merge(HINGE, both({ LeftArm: [28, 12, -70], LeftForeArm: [0, -16, 0] }))),
      pose(0.85, merge(HINGE, both({ LeftArm: [-42, 24, -36], LeftForeArm: [0, -98, 0] }))),
      pose(1.2, merge(HINGE, both({ LeftArm: [-42, 24, -36], LeftForeArm: [0, -98, 0] }))),
      pose(2.4, merge(HINGE, both({ LeftArm: [28, 12, -70], LeftForeArm: [0, -16, 0] })))
    ]
  },
  "rear-delt-fly": {
    duration: 2.4,
    plant: "feet",
    poses: [
      pose(0, merge(HINGE, both({ LeftArm: [20, 8, -70], LeftForeArm: [0, -12, 0] }))),
      pose(0.85, merge(HINGE, both({ LeftArm: [-10, 8, -8], LeftForeArm: [0, -14, 0] }))),
      pose(1.2, merge(HINGE, both({ LeftArm: [-10, 8, -8], LeftForeArm: [0, -14, 0] }))),
      pose(2.4, merge(HINGE, both({ LeftArm: [20, 8, -70], LeftForeArm: [0, -12, 0] })))
    ]
  },
  "calf-raise": {
    duration: 2,
    plant: "toes",
    poses: [
      pose(0, STAND),
      pose(0.7, merge(STAND, both({ LeftLeg: [2, 0, 0], LeftFoot: [52, 0, 0] }))),
      pose(1.1, merge(STAND, both({ LeftLeg: [2, 0, 0], LeftFoot: [52, 0, 0] }))),
      pose(2, STAND)
    ]
  },
  "high-knees": {
    duration: 1.2,
    plant: "feet",
    poses: [
      pose(0, HIGH_KNEE_LEFT),
      pose(0.6, HIGH_KNEE_RIGHT),
      pose(1.2, HIGH_KNEE_LEFT)
    ]
  },
  "good-morning": {
    duration: 2.6,
    plant: "feet",
    poses: [
      pose(0, merge(STAND, both({ LeftArm: [-80, -40, 40], LeftForeArm: [0, -86, 0] }))),
      pose(
        1.1,
        merge(HINGE, both({ LeftArm: [-80, -40, 40], LeftForeArm: [0, -86, 0], LeftUpLeg: [-62, 2, 3], LeftLeg: [14, 0, 0] }))
      ),
      pose(
        1.45,
        merge(HINGE, both({ LeftArm: [-80, -40, 40], LeftForeArm: [0, -86, 0], LeftUpLeg: [-62, 2, 3], LeftLeg: [14, 0, 0] }))
      ),
      pose(2.6, merge(STAND, both({ LeftArm: [-80, -40, 40], LeftForeArm: [0, -86, 0] })))
    ]
  },
  "jump-squat": {
    duration: 2,
    plant: "feet",
    poses: [
      pose(0, STAND),
      pose(0.7, SQUAT),
      pose(1.05, { ...OVERHEAD, Spine: [2, 0, 0] }, { hop: 0.2 }),
      pose(1.4, STAND),
      pose(2, STAND)
    ]
  },
  burpee: {
    duration: 2.4,
    plant: "feet",
    poses: [
      pose(0, STAND),
      pose(
        0.7,
        both({
          LeftUpLeg: [-98, 6, 10],
          LeftLeg: [118, 0, 0],
          LeftFoot: [-18, 0, 0],
          Spine: [46, 0, 0],
          Spine1: [20, 0, 0],
          LeftArm: [-20, -40, -80],
          LeftForeArm: [0, -16, 0]
        })
      ),
      pose(0.95, both({
        LeftUpLeg: [-98, 6, 10],
        LeftLeg: [118, 0, 0],
        LeftFoot: [-18, 0, 0],
        Spine: [46, 0, 0],
        Spine1: [20, 0, 0],
        LeftArm: [-20, -40, -80],
        LeftForeArm: [0, -16, 0]
      })),
      pose(1.3, OVERHEAD, { hop: 0.24 }),
      pose(1.7, STAND),
      pose(2.4, STAND)
    ]
  },
  thruster: {
    duration: 2.6,
    plant: "feet",
    poses: [
      pose(0, RACK),
      pose(0.9, merge(SQUAT, both({ LeftArm: [-40, 0, -80], LeftForeArm: [0, -48, 0] }))),
      pose(1.45, OVERHEAD),
      pose(1.8, OVERHEAD),
      pose(2.6, RACK)
    ]
  },
  "kettlebell-swing": {
    duration: 2.2,
    plant: "feet",
    // 下摆稍慢，髋发力快，顶端短停，再摆回腿间。不要在站姿上把手慢慢放下。
    segments: [{ hold: 0.2 }, { tempo: 0.38 }, { hold: 0.35 }, { tempo: 0.7 }],
    poses: [
      pose(0, KB_HIKE),
      pose(0.24, KB_HIKE),
      pose(0.6, KB_TOP),
      pose(0.98, KB_TOP),
      pose(2.2, KB_HIKE)
    ]
  },
  "tricep-extension": {
    duration: 2.2,
    plant: "feet",
    poses: [
      pose(0, OVERHEAD),
      pose(0.8, merge(OVERHEAD, both({ LeftForeArm: [0, -130, 0] }))),
      pose(1.15, merge(OVERHEAD, both({ LeftForeArm: [0, -130, 0] }))),
      pose(2.2, OVERHEAD)
    ]
  },
  "pull-up": {
    duration: 2.2,
    plant: "hands",
    poses: [
      pose(0, merge(TUCK, both({ LeftArm: [60, 100, 40], LeftForeArm: [0, -8, 0], Spine: [10, 0, 0] }))),
      pose(0.8, merge(TUCK, both({ LeftArm: [-40, 0, 60], LeftForeArm: [0, -92, 0], Spine: [-14, 0, 0] }))),
      pose(1.15, merge(TUCK, both({ LeftArm: [-40, 0, 60], LeftForeArm: [0, -92, 0], Spine: [-14, 0, 0] }))),
      pose(2.2, merge(TUCK, both({ LeftArm: [60, 100, 40], LeftForeArm: [0, -8, 0], Spine: [10, 0, 0] })))
    ]
  },
  "sit-up": {
    duration: 2.4,
    plant: "none",
    poses: [
      pose(0, merge(SUPINE_LEGS, both({ LeftArm: [24, 10, -50], LeftForeArm: [0, -64, 0] })), FLOOR),
      pose(
        0.9,
        merge(SUPINE_LEGS, both({ Spine: [58, 0, 0], Spine1: [32, 0, 0], Spine2: [16, 0, 0], LeftArm: [24, 10, -50], LeftForeArm: [0, -64, 0] })),
        FLOOR
      ),
      pose(
        1.25,
        merge(SUPINE_LEGS, both({ Spine: [58, 0, 0], Spine1: [32, 0, 0], Spine2: [16, 0, 0], LeftArm: [24, 10, -50], LeftForeArm: [0, -64, 0] })),
        FLOOR
      ),
      pose(2.4, merge(SUPINE_LEGS, both({ LeftArm: [24, 10, -50], LeftForeArm: [0, -64, 0] })), FLOOR)
    ]
  },
  crunch: {
    duration: 2,
    plant: "none",
    poses: [
      pose(0, merge(SUPINE_LEGS, both({ LeftArm: [20, 8, -48], LeftForeArm: [0, -60, 0] })), FLOOR),
      pose(
        0.7,
        merge(SUPINE_LEGS, both({ Spine: [34, 0, 0], Spine1: [20, 0, 0], Spine2: [10, 0, 0], LeftArm: [20, 8, -48], LeftForeArm: [0, -60, 0] })),
        FLOOR
      ),
      pose(
        1.05,
        merge(SUPINE_LEGS, both({ Spine: [34, 0, 0], Spine1: [20, 0, 0], Spine2: [10, 0, 0], LeftArm: [20, 8, -48], LeftForeArm: [0, -60, 0] })),
        FLOOR
      ),
      pose(2, merge(SUPINE_LEGS, both({ LeftArm: [20, 8, -48], LeftForeArm: [0, -60, 0] })), FLOOR)
    ]
  },
  "lying-leg-raise": {
    duration: 2.4,
    plant: "none",
    poses: [
      pose(0, both({ LeftUpLeg: [0, 3, 3], LeftLeg: [6, 0, 0], LeftArm: [24, 10, -50], LeftForeArm: [0, -20, 0], Spine: [6, 0, 0] }), FLOOR),
      pose(0.9, both({ LeftUpLeg: [-102, 3, 3], LeftLeg: [6, 0, 0], LeftArm: [24, 10, -50], LeftForeArm: [0, -20, 0], Spine: [6, 0, 0] }), FLOOR),
      pose(1.25, both({ LeftUpLeg: [-102, 3, 3], LeftLeg: [6, 0, 0], LeftArm: [24, 10, -50], LeftForeArm: [0, -20, 0], Spine: [6, 0, 0] }), FLOOR),
      pose(2.4, both({ LeftUpLeg: [0, 3, 3], LeftLeg: [6, 0, 0], LeftArm: [24, 10, -50], LeftForeArm: [0, -20, 0], Spine: [6, 0, 0] }), FLOOR)
    ]
  },
  "bench-press": {
    duration: 2.4,
    plant: "none",
    poses: [
      pose(0, merge(SUPINE_LEGS, both({ LeftArm: [-60, -30, -60], LeftForeArm: [0, -125, 0] })), FLOOR),
      pose(0.85, merge(SUPINE_LEGS, both({ LeftArm: [-60, -30, -60], LeftForeArm: [0, -18, 0] })), FLOOR),
      pose(1.2, merge(SUPINE_LEGS, both({ LeftArm: [-60, -30, -60], LeftForeArm: [0, -18, 0] })), FLOOR),
      pose(2.4, merge(SUPINE_LEGS, both({ LeftArm: [-60, -30, -60], LeftForeArm: [0, -125, 0] })), FLOOR)
    ]
  },
  "russian-twist": {
    duration: 2,
    plant: "none",
    poses: [
      pose(
        0,
        merge(SUPINE_LEGS, both({ Spine: [42, -20, 0], Spine1: [12, -8, 0], LeftArm: [-20, 20, -50], LeftForeArm: [0, -90, 0] })),
        FLOOR
      ),
      pose(
        1,
        merge(SUPINE_LEGS, both({ Spine: [42, 20, 0], Spine1: [12, 8, 0], LeftArm: [-20, 20, -50], LeftForeArm: [0, -90, 0] })),
        FLOOR
      ),
      pose(
        2,
        merge(SUPINE_LEGS, both({ Spine: [42, -20, 0], Spine1: [12, -8, 0], LeftArm: [-20, 20, -50], LeftForeArm: [0, -90, 0] })),
        FLOOR
      )
    ]
  },
  /** 杠铃锁在头顶的深蹲，供过头深蹲的对比模式 */
  "overhead-squat": {
    duration: 2.6,
    plant: "feet",
    poses: [
      pose(0, merge(STAND, both({ LeftArm: [60, 100, 40], LeftForeArm: [0, -12, 0] }))),
      pose(1.05, merge(SQUAT, both({ LeftArm: [60, 100, 40], LeftForeArm: [0, -12, 0] }))),
      pose(1.4, merge(SQUAT, both({ LeftArm: [60, 100, 40], LeftForeArm: [0, -12, 0] }))),
      pose(2.6, merge(STAND, both({ LeftArm: [60, 100, 40], LeftForeArm: [0, -12, 0] })))
    ]
  },
  /** 开合跳：站立 ↔ 分腿举手 */
  "jumping-jack": {
    duration: 1.6,
    plant: "feet",
    poses: [
      pose(0, STAND),
      pose(
        0.35,
        merge(both({ LeftArm: [60, 100, 40], LeftForeArm: [0, -8, 0], LeftUpLeg: [-10, 6, 18], LeftLeg: [8, 0, 0] })),
        { hop: 0.06 }
      ),
      pose(0.8, STAND),
      pose(
        1.15,
        merge(both({ LeftArm: [60, 100, 40], LeftForeArm: [0, -8, 0], LeftUpLeg: [-10, 6, 18], LeftLeg: [8, 0, 0] })),
        { hop: 0.06 }
      ),
      pose(1.6, STAND)
    ]
  },
  /** 击掌俯卧撑的生成版：下落后撑起跳起 */
  "jump-push-up": {
    duration: 2.2,
    plant: "hands",
    poses: [
      pose(0, PUSHUP_TOP, PRONE),
      pose(0.7, PUSHUP_BOTTOM, PRONE),
      pose(1.05, PUSHUP_TOP, { ...PRONE, hop: 0.14 }),
      pose(1.45, PUSHUP_TOP, PRONE),
      pose(2.2, PUSHUP_TOP, PRONE)
    ]
  },
  // ---------- 新增徒手动作 ----------
  "glute-bridge": {
    duration: 2.4,
    plant: "none",
    poses: [
      pose(0, GLUTE_BRIDGE_DOWN, FLOOR),
      pose(0.9, GLUTE_BRIDGE_TOP, FLOOR),
      pose(1.3, GLUTE_BRIDGE_TOP, FLOOR),
      pose(2.4, GLUTE_BRIDGE_DOWN, FLOOR)
    ]
  },
  "side-plank": {
    duration: 1.6,
    plant: "none",
    poses: [pose(0, SIDE_PLANK_ROT, SIDE_PLANK), pose(1.6, SIDE_PLANK_ROT, SIDE_PLANK)]
  },
  "mountain-climber": {
    duration: 1.2,
    plant: "hands",
    poses: [
      pose(0, MOUNTAIN_CLIMBER_LEFT, PRONE),
      pose(0.6, MOUNTAIN_CLIMBER_RIGHT, PRONE),
      pose(1.2, MOUNTAIN_CLIMBER_LEFT, PRONE)
    ]
  },
  "diamond-push-up": {
    duration: 2.2,
    plant: "hands",
    poses: [
      pose(0, DIAMOND_TOP, PRONE),
      pose(0.85, DIAMOND_BOTTOM, PRONE),
      pose(1.2, DIAMOND_BOTTOM, PRONE),
      pose(2.2, DIAMOND_TOP, PRONE)
    ]
  },
  superman: {
    duration: 2.4,
    plant: "none",
    poses: [
      pose(0, SUPERMAN_DOWN, PRONE),
      pose(0.9, SUPERMAN_UP, PRONE),
      pose(1.3, SUPERMAN_UP, PRONE),
      pose(2.4, SUPERMAN_DOWN, PRONE)
    ]
  },
  "side-lunge": {
    duration: 3.2,
    plant: "feet",
    poses: [
      pose(0, STAND),
      pose(0.7, SIDE_LUNGE_LEFT),
      pose(1.05, SIDE_LUNGE_LEFT),
      pose(1.6, STAND),
      pose(2.3, SIDE_LUNGE_RIGHT),
      pose(2.65, SIDE_LUNGE_RIGHT),
      pose(3.2, STAND)
    ]
  }
};
var LIFT_RHYTHM = [{ tempo: 1.6 }, { hold: 0.28 }, { tempo: 0.6 }];
for (const id of [
  "squat",
  "deadlift",
  "push-up",
  "bicep-curl",
  "overhead-press",
  "bench-press",
  "romanian-deadlift",
  "good-morning",
  "calf-raise",
  "lateral-raise",
  "front-raise",
  "tricep-extension",
  "overhead-squat",
  "bent-over-row",
  "rear-delt-fly",
  "glute-bridge",
  "diamond-push-up",
  "superman"
]) {
  const motion = MOTIONS[id];
  if (motion && motion.poses.length === 4) motion.segments = LIFT_RHYTHM.map((s) => ({ ...s }));
}
MOTIONS.lunge.segments = [
  { tempo: 1.45 },
  { hold: 0.22 },
  { tempo: 0.65 },
  { tempo: 1.45 },
  { hold: 0.22 },
  { tempo: 0.65 }
];
MOTIONS["side-lunge"].segments = [
  { tempo: 1.45 },
  { hold: 0.22 },
  { tempo: 0.65 },
  { tempo: 1.45 },
  { hold: 0.22 },
  { tempo: 0.65 }
];

// src/motion/faults.ts
function cloneMotion(baseId) {
  const base = MOTIONS[baseId];
  if (!base) throw new Error(`\u7F3A\u5C11\u57FA\u7840\u52A8\u4F5C ${baseId}`);
  return {
    duration: base.duration,
    plant: base.plant,
    segments: base.segments?.map((segment) => ({ ...segment })),
    poses: base.poses.map((pose2) => ({
      t: pose2.t,
      rot: Object.fromEntries(Object.entries(pose2.rot).map(([name, euler]) => [name, [...euler]])),
      hop: pose2.hop,
      hips: pose2.hips ? [...pose2.hips] : void 0,
      hipsRot: pose2.hipsRot ? [...pose2.hipsRot] : void 0
    }))
  };
}
function addRot(rot, delta, mirror2) {
  const extra = mirror2 ? both(delta) : delta;
  const out = { ...rot };
  for (const [name, euler] of Object.entries(extra)) {
    const base = out[name] ?? [0, 0, 0];
    out[name] = [base[0] + euler[0], base[1] + euler[1], base[2] + euler[2]];
  }
  return out;
}
function hits(when, index, count) {
  if (when === "rest") return index > 0;
  if (when === "end") return index >= Math.max(1, count - 2);
  return index > 0 && index < count - 1;
}
function buildSpec(spec) {
  const motion = cloneMotion(spec.base);
  const count = motion.poses.length;
  const when = spec.when ?? "mid";
  for (let i = 0; i < count; i++) {
    if (!hits(when, i, count)) continue;
    const pose2 = motion.poses[i];
    if (spec.delta) pose2.rot = addRot(pose2.rot, spec.delta, spec.mirror !== false);
    if (spec.hop != null) pose2.hop = spec.hop;
    if (spec.hips && pose2.hips) {
      pose2.hips = [pose2.hips[0] + spec.hips[0], pose2.hips[1] + spec.hips[1], pose2.hips[2] + spec.hips[2]];
    }
    spec.edit?.(pose2, i, count);
  }
  if (spec.segments) motion.segments = spec.segments;
  if (spec.rush) {
    motion.segments = Array.from({ length: Math.max(1, count - 1) }, (_, i) => ({
      tempo: i % 2 === 0 ? 0.42 : 1.85,
      hold: 0
    }));
  }
  return motion;
}
var SPECS = [
  { id: "squat-x-heels", base: "squat", delta: { LeftFoot: [40, 0, 0], Spine: [8, 0, 0] } },
  { id: "squat-x-round", base: "squat", delta: { Spine: [22, 0, 0], Spine1: [14, 0, 0], Neck: [12, 0, 0], Head: [10, 0, 0] } },
  { id: "squat-x-shallow", base: "squat", delta: { LeftUpLeg: [34, 0, 0], LeftLeg: [-48, 0, 0] } },
  { id: "squat-x-knees", base: "squat", delta: { LeftUpLeg: [30, 0, 0], LeftLeg: [18, 0, 0], LeftFoot: [14, 0, 0] } },
  { id: "ohs-x-bend", base: "overhead-squat", delta: { LeftForeArm: [0, -58, 0], LeftArm: [12, -24, 0] } },
  { id: "ohs-x-lean", base: "overhead-squat", delta: { Spine: [22, 0, 0], Spine1: [10, 0, 0] } },
  { id: "ohs-x-loose", base: "overhead-squat", delta: { Spine: [16, 0, 0], Spine1: [12, 0, 0], LeftUpLeg: [8, 0, 0] } },
  { id: "ohs-x-shallow", base: "overhead-squat", delta: { LeftUpLeg: [36, 0, 0], LeftLeg: [-42, 0, 0] } },
  { id: "push-up-x-flare", base: "push-up", delta: { LeftArm: [0, 26, -20] } },
  { id: "push-up-x-half", base: "push-up", delta: { LeftForeArm: [0, 0, 48] } },
  { id: "push-up-x-neck", base: "push-up", delta: { Neck: [22, 0, 0], Head: [16, 0, 0] } },
  { id: "jpu-x-sag", base: "jump-push-up", delta: { Spine: [18, 0, 0], Spine1: [10, 0, 0] } },
  { id: "jpu-x-lock", base: "jump-push-up", when: "end", delta: { LeftForeArm: [0, 0, 20], LeftLeg: [-6, 0, 0] } },
  { id: "jpu-x-whip", base: "jump-push-up", delta: { Spine: [24, 0, 0], Spine1: [12, 0, 0] } },
  { id: "jpu-x-wrist", base: "jump-push-up", delta: { LeftHand: [36, 0, 18] } },
  { id: "deadlift-x-far", base: "deadlift", delta: { LeftArm: [26, 18, 12], LeftForeArm: [0, -24, 0] } },
  { id: "deadlift-x-hips", base: "deadlift", delta: { LeftLeg: [-34, 0, 0], Spine: [12, 0, 0], LeftUpLeg: [-10, 0, 0] } },
  { id: "plank-x-pike", base: "plank", delta: { Spine: [-24, 0, 0], Spine1: [-10, 0, 0] } },
  { id: "plank-x-breath", base: "plank", delta: { LeftShoulder: [12, 0, -14], Neck: [10, 0, 0] } },
  { id: "plank-x-elbow", base: "plank", delta: { LeftArm: [24, -12, 0] } },
  { id: "lunge-x-valgus", base: "lunge", delta: { LeftUpLeg: [0, -18, -14] } },
  {
    id: "lunge-x-short",
    base: "lunge",
    mirror: false,
    delta: { LeftUpLeg: [20, 0, 0], RightUpLeg: [8, 0, 0], LeftLeg: [-18, 0, 0], RightLeg: [-28, 0, 0] }
  },
  { id: "lunge-x-lean", base: "lunge", delta: { Spine: [16, 0, 0], Spine1: [8, 0, 0] } },
  {
    id: "lunge-x-wobble",
    base: "lunge",
    mirror: false,
    delta: { Spine: [0, 14, 8], LeftFoot: [8, 12, 0], RightFoot: [-8, -10, 0] }
  },
  { id: "bicep-x-elbow", base: "bicep-curl", delta: { LeftArm: [20, 8, 10] } },
  { id: "bicep-x-drop", base: "bicep-curl", rush: true },
  { id: "bicep-x-wrist", base: "bicep-curl", delta: { LeftHand: [42, -22, 0] } },
  { id: "sit-up-x-neck", base: "sit-up", delta: { Neck: [28, 0, 0], Head: [22, 0, 0] } },
  { id: "sit-up-x-yank", base: "sit-up", rush: true },
  { id: "sit-up-x-arch", base: "sit-up", delta: { Spine: [12, 0, 0] }, hips: [0, 6, 0] },
  { id: "sit-up-x-slam", base: "sit-up", rush: true },
  { id: "jj-x-lock", base: "jumping-jack", when: "rest", delta: { LeftLeg: [-10, 0, 0] } },
  {
    id: "jj-x-loose",
    base: "jumping-jack",
    mirror: false,
    delta: { LeftArm: [18, -28, 16], RightUpLeg: [6, 0, -8] }
  },
  { id: "jj-x-flat", base: "jumping-jack", when: "end", delta: { LeftFoot: [18, 0, 0], LeftLeg: [-8, 0, 0] } },
  { id: "jj-x-rush", base: "jumping-jack", rush: true },
  { id: "bench-x-wrist", base: "bench-press", delta: { LeftHand: [32, -28, 0] } },
  { id: "bench-x-high", base: "bench-press", delta: { LeftForeArm: [0, -70, 0] } },
  { id: "bench-x-bridge", base: "bench-press", delta: { Spine: [-14, 0, 0] }, hips: [0, 5, 0] },
  { id: "pull-up-x-kip", base: "pull-up", delta: { Spine: [20, 0, 0], LeftUpLeg: [-24, 0, 0] } },
  { id: "pull-up-x-half", base: "pull-up", delta: { LeftForeArm: [0, 40, 0] } },
  { id: "pull-up-x-shrug", base: "pull-up", delta: { LeftShoulder: [14, 0, -16], Neck: [8, 0, 0] } },
  { id: "pull-up-x-wide", base: "pull-up", delta: { LeftArm: [0, 26, -18] } },
  { id: "ohp-x-lean", base: "overhead-press", when: "rest", delta: { Spine: [-16, 0, 0], Spine1: [-8, 0, 0] } },
  { id: "ohp-x-forward", base: "overhead-press", delta: { LeftArm: [18, -26, 0] } },
  { id: "ohp-x-grip", base: "overhead-press", delta: { LeftArm: [0, 20, 14] } },
  { id: "ohp-x-shrug", base: "overhead-press", when: "end", delta: { LeftShoulder: [16, 0, -18] } },
  { id: "burpee-x-sag", base: "burpee", delta: { Spine: [16, 0, 0], Spine1: [10, 0, 0] } },
  { id: "burpee-x-lock", base: "burpee", when: "end", delta: { LeftLeg: [-10, 0, 0] } },
  { id: "burpee-x-rush", base: "burpee", rush: true },
  { id: "burpee-x-sloppy", base: "burpee", delta: { Spine: [12, 0, 0], LeftUpLeg: [18, 0, 0] }, hop: 0.05 },
  { id: "rdl-x-squat", base: "romanian-deadlift", delta: { LeftLeg: [42, 0, 0], LeftUpLeg: [-16, 0, 0] } },
  { id: "rdl-x-round", base: "romanian-deadlift", delta: { Spine: [18, 0, 0], Spine1: [12, 0, 0], Neck: [10, 0, 0], Head: [8, 0, 0] } },
  { id: "rdl-x-far", base: "romanian-deadlift", delta: { LeftArm: [22, 16, 8] } },
  { id: "rdl-x-hyper", base: "romanian-deadlift", when: "end", delta: { Spine: [-18, 0, 0], Spine1: [-10, 0, 0] } },
  { id: "gm-x-squat", base: "good-morning", delta: { LeftLeg: [38, 0, 0], LeftUpLeg: [-14, 0, 0] } },
  { id: "gm-x-neck", base: "good-morning", delta: { Neck: [18, 0, 0], Head: [22, 0, 0], Spine: [6, 0, 0] } },
  { id: "gm-x-deep", base: "good-morning", delta: { Spine: [16, 0, 0], Spine1: [10, 0, 0], LeftUpLeg: [-12, 0, 0] } },
  { id: "row-x-yank", base: "bent-over-row", delta: { Spine: [8, 14, 0] }, rush: true },
  { id: "row-x-bounce", base: "bent-over-row", delta: { Spine: [0, 16, 8] } },
  { id: "row-x-flare", base: "bent-over-row", delta: { LeftArm: [0, 22, -16] } },
  { id: "row-x-round", base: "bent-over-row", delta: { Spine: [14, 0, 0], Spine1: [12, 0, 0], Neck: [8, 0, 0] } },
  { id: "rdf-x-row", base: "rear-delt-fly", delta: { LeftForeArm: [0, -70, 0], LeftArm: [-22, 0, 0] } },
  { id: "rdf-x-shrug", base: "rear-delt-fly", delta: { LeftShoulder: [14, 0, -12] } },
  { id: "rdf-x-swing", base: "rear-delt-fly", delta: { Spine: [0, 16, 0] } },
  { id: "rdf-x-lock", base: "rear-delt-fly", delta: { LeftForeArm: [0, 14, 0] } },
  { id: "lat-x-swing", base: "lateral-raise", delta: { Spine: [16, 0, 0], Spine1: [6, 0, 0] } },
  { id: "lat-x-high", base: "lateral-raise", delta: { LeftArm: [0, 0, 22] } },
  { id: "lat-x-wrist", base: "lateral-raise", delta: { LeftHand: [0, 0, 34] } },
  { id: "lat-x-drop", base: "lateral-raise", rush: true },
  { id: "front-x-sway", base: "front-raise", delta: { Spine: [12, 12, 0] } },
  { id: "front-x-high", base: "front-raise", delta: { LeftArm: [-18, 0, 0] } },
  { id: "front-x-hyper", base: "front-raise", when: "end", delta: { Spine: [-14, 0, 0] } },
  { id: "front-x-lock", base: "front-raise", delta: { LeftForeArm: [0, 14, 0] } },
  { id: "tri-x-swing", base: "tricep-extension", delta: { LeftArm: [16, -12, 8] } },
  { id: "tri-x-flare", base: "tricep-extension", delta: { LeftArm: [0, 0, -22] } },
  { id: "tri-x-short", base: "tricep-extension", delta: { LeftForeArm: [0, 52, 0] } },
  { id: "tri-x-lean", base: "tricep-extension", delta: { Spine: [-16, 0, 0] } },
  { id: "calf-x-lean", base: "calf-raise", delta: { Spine: [14, 0, 0] } },
  { id: "calf-x-half", base: "calf-raise", delta: { LeftFoot: [-28, 0, 0] } },
  { id: "calf-x-bend", base: "calf-raise", delta: { LeftLeg: [30, 0, 0] } },
  { id: "calf-x-bounce", base: "calf-raise", rush: true },
  { id: "js-x-valgus", base: "jump-squat", delta: { LeftUpLeg: [0, -24, -16], LeftLeg: [0, -8, -6] } },
  { id: "js-x-shallow", base: "jump-squat", delta: { LeftUpLeg: [32, 0, 0], LeftLeg: [-40, 0, 0] }, hop: 0.04 },
  { id: "js-x-lock", base: "jump-squat", when: "end", delta: { LeftLeg: [-10, 0, 0] } },
  { id: "js-x-round", base: "jump-squat", delta: { Spine: [16, 0, 0], Spine1: [8, 0, 0], Neck: [8, 0, 0] } },
  { id: "hk-x-lean", base: "high-knees", when: "rest", delta: { Spine: [-14, 0, 0] } },
  { id: "hk-x-stomp", base: "high-knees", when: "rest", delta: { LeftFoot: [16, 0, 0], LeftLeg: [-8, 0, 0] } },
  { id: "hk-x-fold", base: "high-knees", when: "rest", delta: { LeftUpLeg: [36, 0, 0], LeftLeg: [14, 0, 0] } },
  { id: "hk-x-slump", base: "high-knees", when: "rest", delta: { Spine: [12, 0, 0], Spine1: [8, 0, 0] } },
  { id: "th-x-lean", base: "thruster", delta: { Spine: [20, 0, 0], Spine1: [8, 0, 0] } },
  { id: "th-x-press", base: "thruster", delta: { LeftUpLeg: [40, 0, 0], LeftLeg: [-50, 0, 0] } },
  { id: "th-x-hyper", base: "thruster", when: "end", delta: { Spine: [-16, 0, 0], Spine1: [-8, 0, 0] } },
  { id: "th-x-loose", base: "thruster", delta: { LeftArm: [14, 18, 10], LeftForeArm: [0, 18, 0] } },
  { id: "kb-x-squat", base: "kettlebell-swing", delta: { LeftLeg: [42, 0, 0], LeftUpLeg: [-16, 0, 0] } },
  { id: "kb-x-arm", base: "kettlebell-swing", delta: { LeftForeArm: [0, -55, 0] } },
  { id: "kb-x-round", base: "kettlebell-swing", delta: { Spine: [16, 0, 0], Spine1: [12, 0, 0], Neck: [8, 0, 0] } },
  { id: "kb-x-hyper", base: "kettlebell-swing", when: "end", delta: { Spine: [-16, 0, 0], Spine1: [-8, 0, 0] } },
  { id: "crunch-x-neck", base: "crunch", delta: { Neck: [24, 0, 0], Head: [18, 0, 0] } },
  { id: "crunch-x-situp", base: "crunch", delta: { Spine: [28, 0, 0], Spine1: [16, 0, 0] } },
  { id: "crunch-x-yank", base: "crunch", rush: true },
  { id: "crunch-x-breath", base: "crunch", delta: { LeftShoulder: [10, 0, -12], Neck: [6, 0, 0] } },
  { id: "llr-x-arch", base: "lying-leg-raise", delta: { Spine: [14, 0, 0], Spine1: [8, 0, 0] }, hips: [0, 4, 0] },
  { id: "llr-x-swing", base: "lying-leg-raise", delta: { LeftUpLeg: [-18, 0, 0] }, rush: true },
  { id: "llr-x-drop", base: "lying-leg-raise", rush: true, delta: { LeftLeg: [10, 0, 0] } },
  { id: "llr-x-breath", base: "lying-leg-raise", delta: { LeftShoulder: [10, 0, -10], Neck: [6, 0, 0] } },
  {
    id: "rt-x-arms",
    base: "russian-twist",
    when: "rest",
    edit: (pose2, index) => {
      if (index === 0) return;
      const swing = index % 2 === 0 ? 48 : -48;
      pose2.rot = {
        ...pose2.rot,
        Spine: [42, 0, 0],
        Spine1: [12, 0, 0],
        LeftArm: [-20, swing, -50],
        RightArm: [-20, swing, 50]
      };
    }
  },
  { id: "rt-x-round", base: "russian-twist", when: "rest", delta: { Spine: [16, 0, 0], Spine1: [12, 0, 0] } },
  { id: "rt-x-fast", base: "russian-twist", rush: true },
  { id: "rt-x-neck", base: "russian-twist", when: "rest", delta: { Neck: [20, 0, 0], Head: [16, 0, 0] } }
];
var FAULT_MOTIONS = Object.fromEntries(SPECS.map((spec) => [spec.id, buildSpec(spec)]));
function errors(labels, ids) {
  return labels.map((label, i) => ({ label, motionId: ids[i] }));
}
var exerciseFaults = {
  squat: {
    base: "squat",
    errors: errors(
      ["\u819D\u76D6\u5185\u6263\uFF08\u819D\u5916\u7FFB\uFF09", "\u811A\u8DDF\u79BB\u5730\u3001\u91CD\u5FC3\u524D\u79FB", "\u5F13\u8170\u9A7C\u80CC\uFF0C\u8170\u690E\u53D7\u538B", "\u4E0B\u8E72\u6DF1\u5EA6\u4E0D\u8DB3"],
      ["squat-x-valgus", "squat-x-heels", "squat-x-round", "squat-x-shallow"]
    )
  },
  "air-squat": {
    base: "squat",
    errors: errors(
      ["\u819D\u76D6\u5185\u6263", "\u811A\u8DDF\u79BB\u5730\u3001\u91CD\u5FC3\u524D\u79FB", "\u542B\u80F8\u5F13\u80CC", "\u53EA\u5C48\u819D\u4E0D\u5C48\u9ACB\uFF0C\u819D\u76D6\u8FC7\u5EA6\u524D\u79FB"],
      ["squat-x-valgus", "squat-x-heels", "squat-x-round", "squat-x-knees"]
    )
  },
  "overhead-squat": {
    base: "overhead-squat",
    errors: errors(
      ["\u624B\u81C2\u5F2F\u66F2\u6216\u6760\u94C3\u524D\u79FB", "\u80A9\u7075\u6D3B\u6027\u4E0D\u8DB3\u5BFC\u81F4\u8EAF\u5E72\u8FC7\u5EA6\u524D\u503E", "\u6838\u5FC3\u677E\u5F1B\u3001\u8170\u90E8\u4EE3\u507F", "\u91CD\u91CF\u8FC7\u5927\u727A\u7272\u52A8\u4F5C\u5E45\u5EA6"],
      ["ohs-x-bend", "ohs-x-lean", "ohs-x-loose", "ohs-x-shallow"]
    )
  },
  "push-up": {
    base: "push-up",
    errors: errors(
      ["\u584C\u8170\u6216\u6485\u81C0", "\u8098\u90E8\u8FC7\u5EA6\u5916\u5C55\u5448 90\xB0", "\u52A8\u4F5C\u5E45\u5EA6\u4E0D\u8DB3\u3001\u53EA\u505A\u534A\u7A0B", "\u9888\u90E8\u524D\u4F38"],
      ["push-up-x-sag", "push-up-x-flare", "push-up-x-half", "push-up-x-neck"]
    )
  },
  "jump-push-up": {
    base: "jump-push-up",
    errors: errors(
      ["\u584C\u8170\u6216\u6485\u81C0\u5B8C\u6210\u8DF3\u8DC3", "\u843D\u5730\u65F6\u8098\u90E8\u9501\u6B7B\u51B2\u51FB\u5173\u8282", "\u9760\u7529\u8170\u800C\u975E\u4E0A\u80A2\u7206\u53D1\u529B", "\u8155\u5173\u8282\u672A\u70ED\u8EAB\u76F4\u63A5\u8BAD\u7EC3"],
      ["jpu-x-sag", "jpu-x-lock", "jpu-x-whip", "jpu-x-wrist"]
    )
  },
  deadlift: {
    base: "deadlift",
    errors: errors(
      ["\u5F13\u80CC\u62C9\u8D77\uFF08\u8170\u690E\u4EE3\u507F\uFF09", "\u6760\u94C3\u79BB\u8EAB\u4F53\u8FC7\u8FDC", "\u5148\u62AC\u81C0\u5BFC\u81F4\u59FF\u52BF\u53D8\u5F62", "\u9501\u5B9A\u65F6\u523B\u610F\u540E\u4EF0"],
      ["deadlift-x-arch", "deadlift-x-far", "deadlift-x-hips", "deadlift-x-hyper"]
    )
  },
  plank: {
    base: "plank",
    errors: errors(
      ["\u8170\u90E8\u4E0B\u6C89\u584C\u9677", "\u81C0\u90E8\u62AC\u5F97\u8FC7\u9AD8", "\u618B\u6C14\u786C\u6491", "\u8098\u90E8\u4F4D\u7F6E\u8FC7\u524D\u6216\u8FC7\u540E"],
      ["plank-x-sag", "plank-x-pike", "plank-x-breath", "plank-x-elbow"]
    )
  },
  lunge: {
    base: "lunge",
    errors: errors(
      ["\u524D\u819D\u5185\u6263", "\u6B65\u5E45\u8FC7\u5C0F\u5BFC\u81F4\u819D\u538B\u8FC7\u5927", "\u8EAF\u5E72\u524D\u503E\u8FC7\u591A", "\u540E\u811A\u4E0D\u7A33\u3001\u8EAB\u4F53\u6643\u52A8"],
      ["lunge-x-valgus", "lunge-x-short", "lunge-x-lean", "lunge-x-wobble"]
    )
  },
  "bicep-curl": {
    base: "bicep-curl",
    errors: errors(
      ["\u7529\u52A8\u8EAB\u4F53\u501F\u529B", "\u8098\u90E8\u524D\u540E\u79FB\u52A8", "\u4E0B\u653E\u8FC7\u5FEB\u5931\u53BB\u5F20\u529B", "\u624B\u8155\u8FC7\u5EA6\u5F2F\u66F2"],
      ["bicep-curl-x-swing", "bicep-x-elbow", "bicep-x-drop", "bicep-x-wrist"]
    )
  },
  "sit-up": {
    base: "sit-up",
    errors: errors(
      ["\u53CC\u624B\u62B1\u5934\u731B\u62C9\u9888\u90E8", "\u501F\u52A9\u60EF\u6027\u5F39\u8D77", "\u8170\u90E8\u60AC\u7A7A\u5F13\u8D77", "\u4E0B\u653E\u65F6\u5B8C\u5168\u653E\u677E\u7838\u5730"],
      ["sit-up-x-neck", "sit-up-x-yank", "sit-up-x-arch", "sit-up-x-slam"]
    )
  },
  "jumping-jack": {
    base: "jumping-jack",
    errors: errors(
      ["\u843D\u5730\u65F6\u819D\u76D6\u5B8C\u5168\u9501\u6B7B", "\u52A8\u4F5C\u677E\u6563\u3001\u624B\u811A\u4E0D\u540C\u6B65", "\u5168\u811A\u638C\u91CD\u843D\u5730\u51B2\u51FB\u5173\u8282", "\u901F\u5EA6\u5FFD\u5FEB\u5FFD\u6162"],
      ["jj-x-lock", "jj-x-loose", "jj-x-flat", "jj-x-rush"]
    )
  },
  "bench-press": {
    base: "bench-press",
    errors: errors(
      ["\u624B\u8155\u8FC7\u5EA6\u540E\u7FFB\u53D7\u538B", "\u8098\u90E8\u5B8C\u5168\u5916\u5C55 90\xB0", "\u6760\u94C3\u4E0B\u653E\u4F4D\u7F6E\u8FC7\u9AD8\uFF08\u7838\u5411\u8116\u5B50\uFF09", "\u81C0\u90E8\u79BB\u51F3\u501F\u529B"],
      ["bench-x-wrist", "bench-press-x-flare", "bench-x-high", "bench-x-bridge"]
    )
  },
  "pull-up": {
    base: "pull-up",
    errors: errors(
      ["\u7529\u8170\u6446\u817F\u501F\u529B\uFF08\u975E\u523B\u610F\u8776\u5F0F\uFF09", "\u4E0B\u653E\u4E0D\u5B8C\u5168\u3001\u53EA\u505A\u534A\u7A0B", "\u8038\u80A9\u7F29\u8116\u3001\u80A9\u80DB\u672A\u542F\u52A8", "\u63E1\u8DDD\u8FC7\u5BBD\u9650\u5236\u5E45\u5EA6"],
      ["pull-up-x-kip", "pull-up-x-half", "pull-up-x-shrug", "pull-up-x-wide"]
    )
  },
  "overhead-press": {
    base: "overhead-press",
    errors: errors(
      ["\u8FC7\u5EA6\u633A\u8170\u501F\u529B\uFF08\u8170\u690E\u53D7\u538B\uFF09", "\u63A8\u8D77\u65F6\u6760\u94C3\u524D\u79FB\u7ED5\u5934", "\u63E1\u8DDD\u8FC7\u7A84\u6216\u8FC7\u5BBD", "\u9501\u5B9A\u65F6\u523B\u610F\u8038\u80A9"],
      ["ohp-x-lean", "ohp-x-forward", "ohp-x-grip", "ohp-x-shrug"]
    )
  },
  burpee: {
    base: "burpee",
    errors: errors(
      ["\u4E0B\u8E72\u65F6\u584C\u8170", "\u843D\u5730\u65F6\u819D\u76D6\u9501\u6B7B\u65E0\u7F13\u51B2", "\u8D77\u8DF3\u524D\u6CA1\u6709\u8E72\u7A33", "\u4E3A\u8FFD\u6C42\u9AD8\u5EA6\u727A\u7272\u59FF\u52BF"],
      ["burpee-x-sag", "burpee-x-lock", "burpee-x-rush", "burpee-x-sloppy"]
    )
  },
  "romanian-deadlift": {
    base: "romanian-deadlift",
    errors: errors(
      ["\u53D8\u6210\u6DF1\u8E72\u3001\u819D\u76D6\u5F2F\u66F2\u8FC7\u591A", "\u5F13\u80CC\u8FFD\u6C42\u4E0B\u653E\u6DF1\u5EA6", "\u6760\u94C3\u79BB\u5F00\u817F\u90E8", "\u7AD9\u76F4\u65F6\u8170\u90E8\u8FC7\u5EA6\u540E\u4EF0"],
      ["rdl-x-squat", "rdl-x-round", "rdl-x-far", "rdl-x-hyper"]
    )
  },
  "good-morning": {
    base: "good-morning",
    errors: errors(
      ["\u5F13\u80CC\u4F4E\u5934", "\u819D\u76D6\u5F2F\u66F2\u8FC7\u591A\u505A\u6210\u6DF1\u8E72", "\u91CD\u91CF\u538B\u5728\u9888\u690E\u4E0A", "\u5E45\u5EA6\u8FC7\u5927\u5BFC\u81F4\u8170\u690E\u5931\u7A33"],
      ["good-morning-x-arch", "gm-x-squat", "gm-x-neck", "gm-x-deep"]
    )
  },
  "bent-over-row": {
    base: "bent-over-row",
    errors: errors(
      ["\u7528\u7529\u8170\u60EF\u6027\u62C9\u8D77", "\u8EAF\u5E72\u8D77\u8D77\u4F0F\u4F0F", "\u8098\u90E8\u8FC7\u5EA6\u5916\u5C55", "\u542B\u80F8\u5706\u80CC"],
      ["row-x-yank", "row-x-bounce", "row-x-flare", "row-x-round"]
    )
  },
  "rear-delt-fly": {
    base: "rear-delt-fly",
    errors: errors(
      ["\u91CD\u91CF\u8FC7\u5927\u53D8\u6210\u5212\u8239", "\u8038\u80A9\u4EE3\u507F", "\u8EAF\u5E72\u8DDF\u7740\u7529\u52A8", "\u624B\u81C2\u5B8C\u5168\u4F38\u76F4\u9501\u6B7B\u8098\u5173\u8282"],
      ["rdf-x-row", "rdf-x-shrug", "rdf-x-swing", "rdf-x-lock"]
    )
  },
  "lateral-raise": {
    base: "lateral-raise",
    errors: errors(
      ["\u7529\u52A8\u8EAB\u4F53\u501F\u529B", "\u62AC\u8FC7\u5934\u9876\u53D8\u6210\u659C\u65B9\u808C\u53D1\u529B", "\u624B\u8155\u9AD8\u4E8E\u8098\u90E8", "\u4E0B\u653E\u65F6\u5B8C\u5168\u653E\u677E"],
      ["lat-x-swing", "lat-x-high", "lat-x-wrist", "lat-x-drop"]
    )
  },
  "front-raise": {
    base: "front-raise",
    errors: errors(
      ["\u8EAB\u4F53\u524D\u540E\u6643\u52A8", "\u62AC\u5F97\u8FC7\u9AD8\u8D85\u8FC7\u80A9", "\u8170\u90E8\u8FC7\u5EA6\u540E\u4EF0", "\u8098\u90E8\u5B8C\u5168\u9501\u6B7B"],
      ["front-x-sway", "front-x-high", "front-x-hyper", "front-x-lock"]
    )
  },
  "tricep-extension": {
    base: "tricep-extension",
    errors: errors(
      ["\u5927\u81C2\u524D\u540E\u6643\u52A8\u501F\u529B", "\u8098\u90E8\u5411\u5916\u6253\u5F00", "\u4E0B\u653E\u5E45\u5EA6\u4E0D\u591F", "\u7528\u8170\u90E8\u540E\u4EF0\u5B8C\u6210\u4E0A\u4E3E"],
      ["tri-x-swing", "tri-x-flare", "tri-x-short", "tri-x-lean"]
    )
  },
  "calf-raise": {
    base: "calf-raise",
    errors: errors(
      ["\u8EAB\u4F53\u524D\u503E\u7528\u4F53\u91CD\u6643\u8D77\u6765", "\u5E45\u5EA6\u53EA\u6709\u4E00\u534A", "\u819D\u76D6\u5927\u5E45\u5F2F\u66F2", "\u901F\u5EA6\u592A\u5FEB\u6CA1\u6709\u9876\u5CF0\u6536\u7F29"],
      ["calf-x-lean", "calf-x-half", "calf-x-bend", "calf-x-bounce"]
    )
  },
  "jump-squat": {
    base: "jump-squat",
    errors: errors(
      ["\u843D\u5730\u819D\u76D6\u5185\u6263", "\u53EA\u8DF3\u4E0D\u9AD8\u8E72", "\u843D\u5730\u65F6\u819D\u76D6\u9501\u6B7B", "\u542B\u80F8\u5F13\u80CC\u8D77\u8DF3"],
      ["js-x-valgus", "js-x-shallow", "js-x-lock", "js-x-round"]
    )
  },
  "high-knees": {
    base: "high-knees",
    errors: errors(
      ["\u8EAB\u4F53\u540E\u4EF0", "\u811A\u638C\u91CD\u7838\u5730\u9762", "\u62AC\u817F\u53EA\u9760\u5C0F\u817F\u6298\u53E0", "\u542B\u80F8\u584C\u8170"],
      ["hk-x-lean", "hk-x-stomp", "hk-x-fold", "hk-x-slump"]
    )
  },
  thruster: {
    base: "thruster",
    errors: errors(
      ["\u4E0B\u8E72\u65F6\u4E25\u91CD\u524D\u503E", "\u53EA\u7528\u624B\u81C2\u786C\u63A8\u3001\u817F\u90E8\u6CA1\u6709\u53D1\u529B", "\u63A8\u8D77\u65F6\u8170\u90E8\u8FC7\u5EA6\u540E\u4EF0", "\u54D1\u94C3\u5728\u80A9\u4E0A\u5931\u53BB\u63A7\u5236"],
      ["th-x-lean", "th-x-press", "th-x-hyper", "th-x-loose"]
    )
  },
  "kettlebell-swing": {
    base: "kettlebell-swing",
    errors: errors(
      ["\u505A\u6210\u6DF1\u8E72", "\u7528\u624B\u81C2\u628A\u58F6\u94C3\u4E3E\u8D77\u6765", "\u5F13\u80CC\u4E0B\u6446", "\u9876\u7AEF\u8EAB\u4F53\u8FC7\u5EA6\u540E\u4EF0"],
      ["kb-x-squat", "kb-x-arm", "kb-x-round", "kb-x-hyper"]
    )
  },
  crunch: {
    base: "crunch",
    errors: errors(
      ["\u53CC\u624B\u62B1\u5934\u62C9\u8116\u5B50", "\u505A\u6210\u5B8C\u6574\u4EF0\u5367\u8D77\u5750", "\u7528\u60EF\u6027\u5F39\u8D77", "\u618B\u6C14"],
      ["crunch-x-neck", "crunch-x-situp", "crunch-x-yank", "crunch-x-breath"]
    )
  },
  "lying-leg-raise": {
    base: "lying-leg-raise",
    errors: errors(
      ["\u4E0B\u80CC\u62F1\u8D77\u79BB\u5F00\u5730\u9762", "\u7528\u7529\u817F\u60EF\u6027", "\u4E0B\u653E\u65F6\u811A\u8DDF\u7838\u5730", "\u618B\u6C14"],
      ["llr-x-arch", "llr-x-swing", "llr-x-drop", "llr-x-breath"]
    )
  },
  "russian-twist": {
    base: "russian-twist",
    errors: errors(
      ["\u53EA\u7529\u624B\u81C2\u3001\u80F8\u690E\u4E0D\u52A8", "\u584C\u8170\u5706\u80CC", "\u901F\u5EA6\u8FC7\u5FEB\u5931\u53BB\u63A7\u5236", "\u7528\u8116\u5B50\u5E26\u52A8\u8F6C\u5411"],
      ["rt-x-arms", "rt-x-round", "rt-x-fast", "rt-x-neck"]
    )
  }
};

// src/motion/catalog.ts
function getMotion(id) {
  return MOTIONS[id] ?? FAULT_MOTIONS[id];
}

// src/motion/buildClip.ts
var DEG = Math.PI / 180;
var HIP = "mixamorigHips";
var BODY_BONES = [
  HIP,
  "mixamorigSpine",
  "mixamorigSpine1",
  "mixamorigSpine2",
  "mixamorigNeck",
  "mixamorigHead",
  "mixamorigLeftShoulder",
  "mixamorigLeftArm",
  "mixamorigLeftForeArm",
  "mixamorigRightShoulder",
  "mixamorigRightArm",
  "mixamorigRightForeArm",
  "mixamorigLeftUpLeg",
  "mixamorigLeftLeg",
  "mixamorigLeftFoot",
  "mixamorigRightUpLeg",
  "mixamorigRightLeg",
  "mixamorigRightFoot"
];
var REST_HIP = [0, 103.991, 2.076];
var FOOT_Y = 0.08;
var TOE_Y = 0;
var HAND_Y = 0.09;
var eulerQuat = (e) => new Quaternion().setFromEuler(new Euler(e[0] * DEG, e[1] * DEG, e[2] * DEG, "XYZ"));
var fullName = (short) => short.startsWith("mixamorig") ? short : "mixamorig" + short;
function bindRig(root) {
  const bones = /* @__PURE__ */ new Map();
  const saved = [];
  root.traverse((o) => {
    const bone = o;
    if (!bone.isBone) return;
    bones.set(bone.name, bone);
    saved.push({ bone, q: bone.quaternion.clone(), p: bone.position.clone() });
  });
  const hips = bones.get(HIP);
  if (!hips) throw new Error("\u6A21\u578B\u91CC\u6CA1\u6709 Mixamo \u9ACB\u9AA8\uFF0C\u65E0\u6CD5\u751F\u6210\u52A8\u4F5C");
  root.updateMatrixWorld(true);
  const scale = new Vector3();
  hips.parent?.getWorldScale(scale);
  return { root, bones, hips, scale: scale.x || 0.01, saved };
}
function restore(rig) {
  for (const s of rig.saved) {
    s.bone.quaternion.copy(s.q);
    s.bone.position.copy(s.p);
  }
  rig.root.updateMatrixWorld(true);
}
function smooth(u) {
  const t = Math.min(1, Math.max(0, u));
  return t * t * (3 - 2 * t);
}
function segmentBlend(u, seg) {
  const hold = Math.min(0.45, Math.max(0, seg?.hold ?? 0));
  const span = 1 - hold;
  const move = span < 1e-4 ? 1 : Math.min(1, Math.max(0, u / span));
  const s = smooth(move);
  const tempo = seg?.tempo ?? 1;
  if (tempo > 1.05) return Math.pow(s, Math.min(tempo, 3));
  if (tempo < 0.95) return 1 - Math.pow(1 - s, 1 / Math.max(0.35, tempo));
  return s;
}
function blendPose(a, b, u) {
  const k = Math.min(1, Math.max(0, u));
  const names = /* @__PURE__ */ new Set([...Object.keys(a.rot), ...Object.keys(b.rot)]);
  const rot = {};
  for (const name of names) {
    const q = eulerQuat(a.rot[name] ?? [0, 0, 0]).slerp(eulerQuat(b.rot[name] ?? [0, 0, 0]), k);
    const e = new Euler().setFromQuaternion(q, "XYZ");
    rot[name] = [e.x * 180 / Math.PI, e.y * 180 / Math.PI, e.z * 180 / Math.PI];
  }
  const ha = a.hips ?? b.hips;
  const hb = b.hips ?? a.hips;
  const hips = ha && hb ? ha.map((v, i) => v + (hb[i] - v) * k) : void 0;
  const ra = a.hipsRot ?? b.hipsRot ?? [0, 0, 0];
  const rb = b.hipsRot ?? a.hipsRot ?? [0, 0, 0];
  const hipsRotQ = eulerQuat(ra).slerp(eulerQuat(rb), k);
  const he = new Euler().setFromQuaternion(hipsRotQ, "XYZ");
  return {
    t: a.t + (b.t - a.t) * u,
    rot,
    hop: (a.hop ?? 0) + ((b.hop ?? 0) - (a.hop ?? 0)) * k,
    hips,
    hipsRot: a.hipsRot || b.hipsRot ? [he.x * 180 / Math.PI, he.y * 180 / Math.PI, he.z * 180 / Math.PI] : void 0
  };
}
function poseAt(motion, time) {
  const poses = motion.poses;
  if (time <= poses[0].t) return poses[0];
  const last = poses[poses.length - 1];
  if (time >= last.t) return last;
  let i = 0;
  while (i < poses.length - 2 && poses[i + 1].t < time) i++;
  const a = poses[i];
  const b = poses[i + 1];
  const span = b.t - a.t || 1;
  return blendPose(a, b, segmentBlend((time - a.t) / span, motion.segments?.[i]));
}
function worldOf(bone, target) {
  bone.getWorldPosition(target);
  return target;
}
function applyPose(rig, motion, pose2, handAnchor) {
  for (const bone of rig.bones.values()) bone.quaternion.identity();
  rig.hips.position.set(...REST_HIP);
  rig.hips.quaternion.identity();
  for (const [name, e] of Object.entries(pose2.rot)) {
    const bone = rig.bones.get(fullName(name));
    if (bone) bone.quaternion.copy(eulerQuat(e));
  }
  if (pose2.hipsRot) rig.hips.quaternion.copy(eulerQuat(pose2.hipsRot));
  if (motion.plant === "none" && pose2.hips) rig.hips.position.set(...pose2.hips);
  rig.root.updateMatrixWorld(true);
  const left = new Vector3();
  const right = new Vector3();
  const s = rig.scale;
  if (motion.plant === "feet" || motion.plant === "toes") {
    const lName = motion.plant === "toes" ? "mixamorigLeftToeBase" : "mixamorigLeftFoot";
    const rName = motion.plant === "toes" ? "mixamorigRightToeBase" : "mixamorigRightFoot";
    worldOf(rig.bones.get(lName), left);
    worldOf(rig.bones.get(rName), right);
    const targetY = motion.plant === "toes" ? TOE_Y : FOOT_Y;
    const bothDown = Math.abs(left.y - right.y) < 0.05;
    let dx;
    let dy;
    let dz;
    if (bothDown) {
      dx = -(left.x + right.x) / 2;
      dy = targetY - Math.min(left.y, right.y);
      dz = -(left.z + right.z) / 2;
    } else if (left.y <= right.y) {
      dx = 0.08 - left.x;
      dy = targetY - left.y;
      dz = -left.z;
    } else {
      dx = -0.08 - right.x;
      dy = targetY - right.y;
      dz = -right.z;
    }
    rig.hips.position.x += dx / s;
    rig.hips.position.y += dy / s;
    rig.hips.position.z += dz / s;
  } else if (motion.plant === "hands") {
    worldOf(rig.bones.get("mixamorigLeftHand"), left);
    worldOf(rig.bones.get("mixamorigRightHand"), right);
    const mid = left.add(right).multiplyScalar(0.5);
    if (!handAnchor) {
      const hipsW = worldOf(rig.hips, new Vector3());
      handAnchor = mid.y < hipsW.y ? new Vector3(mid.x, HAND_Y, mid.z) : mid.clone();
    }
    rig.hips.position.x += (handAnchor.x - mid.x) / s;
    rig.hips.position.y += (handAnchor.y - mid.y) / s;
    rig.hips.position.z += (handAnchor.z - mid.z) / s;
  }
  if (pose2.hop) rig.hips.position.y += pose2.hop / s;
  rig.root.updateMatrixWorld(true);
  return handAnchor;
}
function readSample(rig, t) {
  const p = new Vector3();
  const grab = (name) => worldOf(rig.bones.get(name), p).toArray().map((n) => +n.toFixed(3));
  return {
    t: +t.toFixed(3),
    footL: grab("mixamorigLeftFoot"),
    footR: grab("mixamorigRightFoot"),
    handL: grab("mixamorigLeftHand"),
    handR: grab("mixamorigRightHand"),
    head: grab("mixamorigHead"),
    hips: grab(HIP)
  };
}
var BREATH_AMP = {
  mixamorigSpine: 0.01,
  mixamorigSpine1: 0.018,
  mixamorigSpine2: 0.014
};
function applyBreath(times, quatValues) {
  const axis = new Vector3(1, 0, 0);
  const breathQ = new Quaternion();
  const tmpQ = new Quaternion();
  for (const [name, amp] of Object.entries(BREATH_AMP)) {
    const arr = quatValues.get(name);
    if (!arr) continue;
    for (let i = 0; i < times.length; i++) {
      const w = Math.sin(times[i] * Math.PI * 2 * 0.5) * amp;
      breathQ.setFromAxisAngle(axis, w);
      tmpQ.fromArray(arr, i * 4).multiply(breathQ);
      tmpQ.toArray(arr, i * 4);
    }
  }
}
function runMotion(rig, id, times) {
  const motion = getMotion(id);
  if (!motion) throw new Error(`\u6CA1\u6709\u8FD9\u4E2A\u751F\u6210\u52A8\u4F5C\uFF1A${id}`);
  let handAnchor = null;
  const samples = [];
  const hipPos = [];
  const hipQuat = [];
  const boneNames = new Set(BODY_BONES);
  for (const pose2 of motion.poses) for (const name of Object.keys(pose2.rot)) boneNames.add(fullName(name));
  const quatValues = /* @__PURE__ */ new Map();
  for (const name of boneNames) quatValues.set(name, []);
  for (const t of times) {
    const pose2 = poseAt(motion, t);
    handAnchor = applyPose(rig, motion, pose2, handAnchor);
    samples.push(readSample(rig, t));
    hipPos.push(rig.hips.position.x, rig.hips.position.y, rig.hips.position.z);
    rig.hips.quaternion.toArray(hipQuat, hipQuat.length);
    for (const name of boneNames) {
      const bone = rig.bones.get(name);
      const arr = quatValues.get(name);
      if (bone) bone.quaternion.toArray(arr, arr.length);
      else arr.push(0, 0, 0, 1);
    }
  }
  applyBreath(times, quatValues);
  const tracks = [
    new VectorKeyframeTrack(`${HIP}.position`, times, hipPos),
    new QuaternionKeyframeTrack(`${HIP}.quaternion`, times, hipQuat)
  ];
  for (const [name, values] of quatValues) {
    if (name === HIP) continue;
    tracks.push(new QuaternionKeyframeTrack(`${name}.quaternion`, times, values));
  }
  return { clip: new AnimationClip(id, motion.duration, tracks), samples };
}
function debugMotion(root, id, steps = 8) {
  const rig = bindRig(root);
  try {
    const motion = getMotion(id);
    if (!motion) throw new Error(`\u6CA1\u6709\u8FD9\u4E2A\u751F\u6210\u52A8\u4F5C\uFF1A${id}`);
    const times = Array.from({ length: steps + 1 }, (_, i) => i / steps * motion.duration);
    return runMotion(rig, id, times).samples;
  } finally {
    restore(rig);
  }
}

// scripts/sanity-entry.ts
var buf = readFileSync(new URL("../public/models/Xbot.glb", import.meta.url));
var ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
var loader = new GLTFLoader();
var draco = new DRACOLoader();
draco.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
loader.setDRACOLoader(draco);
var gltf = await new Promise((res, rej) => loader.parse(ab, "", res, rej));
var scene = gltf.scene;
function drift(samples, pick) {
  const xs = samples.map((s) => pick(s)[0]);
  const zs = samples.map((s) => pick(s)[2]);
  return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs));
}
function run() {
  const FEET_MOTIONS = ["squat", "squat-x-valgus", "deadlift-x-arch", "deadlift-x-hyper", "bicep-curl-x-swing", "good-morning-x-arch", "side-lunge"];
  const HANDS_MOTIONS = ["push-up", "push-up-x-sag", "plank", "plank-x-sag", "pull-up", "mountain-climber", "diamond-push-up"];
  const FLOOR_NONE_MOTIONS = ["bench-press-x-flare", "sit-up", "bench-press", "glute-bridge", "superman", "side-plank"];
  let bad = 0;
  for (const id of FEET_MOTIONS) {
    const s = debugMotion(scene, id, 10);
    const footY = [...s.map((f) => f.footL[1]), ...s.map((f) => f.footR[1])];
    const minY = Math.min(...footY);
    const maxY = Math.max(...footY);
    const ok = minY > -0.05 && maxY < 0.25;
    if (!ok) bad++;
    console.log(
      `${ok ? "\u2713" : "\u2717"} ${id} \u811A\u9AD8 y\u2208[${minY.toFixed(2)}, ${maxY.toFixed(2)}] \u9ACB\u9AD8 y\u2208[${Math.min(...s.map((f) => f.hips[1])).toFixed(2)}, ${Math.max(...s.map((f) => f.hips[1])).toFixed(2)}]`
    );
  }
  for (const id of HANDS_MOTIONS) {
    const s = debugMotion(scene, id, 10);
    const d = Math.max(drift(s, (f) => f.handL), drift(s, (f) => f.handR));
    const handY = s.map((f) => (f.handL[1] + f.handR[1]) / 2);
    const handYRange = Math.max(...handY) - Math.min(...handY);
    const hipY = s.map((f) => f.hips[1]);
    const prone = id !== "pull-up";
    const driftLimit = prone ? 0.12 : 0.3;
    const bodyOk = prone ? Math.min(...hipY) > 0.1 && Math.max(...hipY) < 0.8 && Math.max(...handY) < 0.2 && Math.min(...handY) > -0.05 : Math.min(...hipY) > 0.2 && handYRange < 0.05;
    const ok = d < driftLimit && bodyOk;
    if (!ok) bad++;
    console.log(
      `${ok ? "\u2713" : "\u2717"} ${id} \u624B\u6F02\u79FB ${d.toFixed(3)}m \u624B\u9AD8y\u2208[${Math.min(...handY).toFixed(2)}, ${Math.max(...handY).toFixed(2)}] \u9ACBy\u2208[${Math.min(...hipY).toFixed(2)}, ${Math.max(...hipY).toFixed(2)}]`
    );
  }
  for (const id of FLOOR_NONE_MOTIONS) {
    const s = debugMotion(scene, id, 10);
    const hipY = s.map((f) => f.hips[1]);
    const ok = Math.min(...hipY) > -0.1 && Math.max(...hipY) < 0.6;
    if (!ok) bad++;
    console.log(
      `${ok ? "\u2713" : "\u2717"} ${id} \u9ACB\u9AD8 y\u2208[${Math.min(...hipY).toFixed(2)}, ${Math.max(...hipY).toFixed(2)}]\uFF08\u4EF0\u5367\u8D34\u5730\uFF09`
    );
  }
  console.log(bad === 0 ? "\u2713 \u65B0\u589E\u52A8\u4F5C\u7EA6\u675F\u5168\u90E8\u5408\u7406" : `\u2717 ${bad} \u4E2A\u52A8\u4F5C\u9700\u8981\u8C03\u6574\u89D2\u5EA6`);
  if (bad > 0) process.exit(1);
}
export {
  run
};
