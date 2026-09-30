// src/data/exercises.ts
var exercises = [
  {
    id: "squat",
    name: "\u6760\u94C3\u6DF1\u8E72",
    nameEn: "Barbell Squat",
    muscle: "\u817F\u90E8",
    equipment: "\u6760\u94C3",
    difficulty: "\u4E2D\u7EA7",
    description: "\u529B\u91CF\u8BAD\u7EC3\u4E4B\u738B\uFF0C\u5168\u9762\u53D1\u5C55\u80A1\u56DB\u5934\u808C\u3001\u81C0\u5927\u808C\u4E0E\u6838\u5FC3\u7A33\u5B9A\u6027\u3002",
    keyPoints: [
      "\u53CC\u811A\u4E0E\u80A9\u540C\u5BBD\uFF0C\u811A\u5C16\u5916\u5C55\u7EA6 15\u201330\xB0",
      "\u4E0B\u8E72\u65F6\u9ACB\u90E8\u5411\u540E\u5750\uFF0C\u819D\u76D6\u59CB\u7EC8\u5BF9\u51C6\u811A\u5C16\u65B9\u5411",
      "\u5168\u7A0B\u80CC\u90E8\u633A\u76F4\u3001\u6838\u5FC3\u6536\u7D27\uFF0C\u76EE\u89C6\u524D\u65B9",
      "\u4E0B\u8E72\u81F3\u5927\u817F\u81F3\u5C11\u4E0E\u5730\u9762\u5E73\u884C\u540E\u53D1\u529B\u7AD9\u8D77"
    ],
    mistakes: ["\u819D\u76D6\u5185\u6263\uFF08\u819D\u5916\u7FFB\uFF09", "\u811A\u8DDF\u79BB\u5730\u3001\u91CD\u5FC3\u524D\u79FB", "\u5F13\u8170\u9A7C\u80CC\uFF0C\u8170\u690E\u53D7\u538B", "\u4E0B\u8E72\u6DF1\u5EA6\u4E0D\u8DB3"],
    sets: "3\u20134 \u7EC4 \xD7 8\u201312 \u6B21",
    keyframes: [
      { at: 0.05, point: 0 },
      { at: 0.3, point: 1 },
      { at: 0.5, point: 2 },
      { at: 0.9, point: 3 }
    ],
    errors: [{ label: "\u819D\u76D6\u5185\u6263\uFF08\u819D\u5916\u7FFB\uFF09", motionId: "squat-x-valgus" }],
    compareMotion: "squat",
    program: { sets: 4, reps: 10, restSeconds: 120 },
    model: { url: "/models/Back Squat.fbx" },
    placeholder: false
  },
  {
    id: "air-squat",
    name: "\u5F92\u624B\u6DF1\u8E72",
    nameEn: "Air Squat",
    muscle: "\u817F\u90E8",
    equipment: "\u81EA\u91CD",
    difficulty: "\u521D\u7EA7",
    description: "\u6DF1\u8E72\u7684\u5165\u95E8\u7248\u672C\uFF0C\u638C\u63E1\u9ACB\u90E8\u53D1\u529B\u6A21\u5F0F\u4E0E\u4E0B\u80A2\u529B\u7EBF\uFF0C\u4E3A\u8D1F\u91CD\u6DF1\u8E72\u6253\u57FA\u7840\u3002",
    keyPoints: [
      "\u53CC\u811A\u4E0E\u80A9\u540C\u5BBD\uFF0C\u811A\u5C16\u5FAE\u5411\u5916\u5C55",
      "\u5C48\u9ACB\u540E\u5750\u5E26\u52A8\u4E0B\u8E72\uFF0C\u819D\u76D6\u5BF9\u51C6\u811A\u5C16",
      "\u4E0B\u8E72\u81F3\u5927\u817F\u4E0E\u5730\u9762\u5E73\u884C\u6216\u7565\u4F4E",
      "\u7AD9\u8D77\u65F6\u811A\u8DDF\u53D1\u529B\uFF0C\u81C0\u817F\u540C\u65F6\u6536\u7D27"
    ],
    mistakes: ["\u819D\u76D6\u5185\u6263", "\u811A\u8DDF\u79BB\u5730\u3001\u91CD\u5FC3\u524D\u79FB", "\u542B\u80F8\u5F13\u80CC", "\u53EA\u5C48\u819D\u4E0D\u5C48\u9ACB\uFF0C\u819D\u76D6\u8FC7\u5EA6\u524D\u79FB"],
    sets: "3\u20134 \u7EC4 \xD7 15\u201320 \u6B21",
    keyframes: [
      { at: 0.05, point: 0 },
      { at: 0.3, point: 1 },
      { at: 0.5, point: 2 },
      { at: 0.9, point: 3 }
    ],
    program: { sets: 3, reps: 15, restSeconds: 60 },
    model: { url: "/models/Air Squat.fbx" },
    placeholder: false
  },
  {
    id: "overhead-squat",
    name: "\u8FC7\u5934\u6DF1\u8E72",
    nameEn: "Overhead Squat",
    muscle: "\u5168\u8EAB",
    equipment: "\u6760\u94C3 / PVC \u6746",
    difficulty: "\u9AD8\u7EA7",
    description: "\u5BF9\u80A9\u5173\u8282\u7075\u6D3B\u6027\u3001\u6838\u5FC3\u7A33\u5B9A\u4E0E\u4E0B\u80A2\u529B\u91CF\u8981\u6C42\u6781\u9AD8\u7684\u4E3E\u91CD\u884D\u751F\u52A8\u4F5C\u3002",
    keyPoints: [
      "\u53CC\u624B\u5BBD\u63E1\u6760\u94C3\u4E3E\u8FC7\u5934\u9876\uFF0C\u624B\u81C2\u5B8C\u5168\u4F38\u76F4",
      "\u80A9\u80DB\u4E3B\u52A8\u4E0A\u9876\uFF0C\u6760\u94C3\u4F4D\u4E8E\u5934\u9876\u6B63\u4E0A\u65B9",
      "\u5168\u7A0B\u4FDD\u6301\u8EAF\u5E72\u76F4\u7ACB\uFF0C\u4E0B\u8E72\u81F3\u5927\u817F\u4F4E\u4E8E\u6C34\u5E73",
      "\u7AD9\u8D77\u65F6\u6760\u94C3\u8F68\u8FF9\u4FDD\u6301\u5782\u76F4\uFF0C\u4E0D\u524D\u540E\u98D8"
    ],
    mistakes: ["\u624B\u81C2\u5F2F\u66F2\u6216\u6760\u94C3\u524D\u79FB", "\u80A9\u7075\u6D3B\u6027\u4E0D\u8DB3\u5BFC\u81F4\u8EAF\u5E72\u8FC7\u5EA6\u524D\u503E", "\u6838\u5FC3\u677E\u5F1B\u3001\u8170\u90E8\u4EE3\u507F", "\u91CD\u91CF\u8FC7\u5927\u727A\u7272\u52A8\u4F5C\u5E45\u5EA6"],
    sets: "3\u20134 \u7EC4 \xD7 6\u201310 \u6B21",
    keyframes: [
      { at: 0.05, point: 0 },
      { at: 0.25, point: 1 },
      { at: 0.5, point: 2 },
      { at: 0.9, point: 3 }
    ],
    program: { sets: 3, reps: 8, restSeconds: 120 },
    model: { url: "/models/Overhead Squat.fbx" },
    placeholder: false
  },
  {
    id: "push-up",
    name: "\u4FEF\u5367\u6491",
    nameEn: "Push-Up",
    muscle: "\u80F8\u90E8",
    equipment: "\u81EA\u91CD",
    difficulty: "\u521D\u7EA7",
    description: "\u7ECF\u5178\u4E0A\u80A2\u63A8\u8BAD\u7EC3\uFF0C\u5F3A\u5316\u80F8\u5927\u808C\u3001\u80B1\u4E09\u5934\u808C\u4E0E\u80A9\u90E8\u524D\u675F\u3002",
    keyPoints: [
      "\u624B\u638C\u7F6E\u4E8E\u80F8\u90E8\u4E24\u4FA7\uFF0C\u7565\u5BBD\u4E8E\u80A9",
      "\u8EAB\u4F53\u4ECE\u5934\u5230\u811A\u5448\u4E00\u6761\u76F4\u7EBF\uFF0C\u6838\u5FC3\u6536\u7D27",
      "\u4E0B\u653E\u65F6\u8098\u90E8\u4E0E\u8EAF\u5E72\u7EA6\u5448 45\xB0",
      "\u80F8\u90E8\u8F7B\u89E6\u5730\u9762\u540E\u63A8\u8D77\u81F3\u624B\u81C2\u4F38\u76F4"
    ],
    mistakes: ["\u584C\u8170\u6216\u6485\u81C0", "\u8098\u90E8\u8FC7\u5EA6\u5916\u5C55\u5448 90\xB0", "\u52A8\u4F5C\u5E45\u5EA6\u4E0D\u8DB3\u3001\u53EA\u505A\u534A\u7A0B", "\u9888\u90E8\u524D\u4F38"],
    sets: "3\u20134 \u7EC4 \xD7 10\u201315 \u6B21",
    keyframes: [
      { at: 0.05, point: 0 },
      { at: 0.2, point: 1 },
      { at: 0.42, point: 2 },
      { at: 0.85, point: 3 }
    ],
    errors: [{ label: "\u584C\u8170\u6216\u6485\u81C0", motionId: "push-up-x-sag" }],
    compareMotion: "push-up",
    program: { sets: 3, reps: 12, restSeconds: 90 },
    model: { url: "/models/Push Up.fbx" },
    placeholder: false
  },
  {
    id: "jump-push-up",
    name: "\u8DF3\u8DC3\u4FEF\u5367\u6491",
    nameEn: "Jump Push-Up",
    muscle: "\u80F8\u90E8",
    equipment: "\u81EA\u91CD",
    difficulty: "\u9AD8\u7EA7",
    description: "\u4FEF\u5367\u6491\u7684\u7206\u53D1\u5F0F\u8FDB\u9636\u7248\uFF0C\u53D1\u5C55\u4E0A\u80A2\u5FEB\u901F\u529B\u91CF\u4E0E\u63A8\u8D77\u529F\u7387\u3002",
    keyPoints: [
      "\u6807\u51C6\u4FEF\u5367\u6491\u59FF\u52BF\u8D77\u59CB\uFF0C\u6838\u5FC3\u5168\u7A0B\u6536\u7D27",
      "\u4E0B\u653E\u540E\u7206\u53D1\u63A8\u8D77\uFF0C\u53CC\u624B\u79BB\u5730",
      "\u79BB\u5730\u65F6\u4FDD\u6301\u8EAB\u4F53\u4E00\u6761\u76F4\u7EBF\uFF0C\u4E0D\u584C\u8170",
      "\u843D\u5730\u65F6\u624B\u638C\u7F13\u51B2\u3001\u8098\u90E8\u5FAE\u5C48\uFF0C\u987A\u52BF\u8FDB\u5165\u4E0B\u4E00\u6B21"
    ],
    mistakes: ["\u584C\u8170\u6216\u6485\u81C0\u5B8C\u6210\u8DF3\u8DC3", "\u843D\u5730\u65F6\u8098\u90E8\u9501\u6B7B\u51B2\u51FB\u5173\u8282", "\u9760\u7529\u8170\u800C\u975E\u4E0A\u80A2\u7206\u53D1\u529B", "\u8155\u5173\u8282\u672A\u70ED\u8EAB\u76F4\u63A5\u8BAD\u7EC3"],
    sets: "3 \u7EC4 \xD7 6\u201310 \u6B21",
    keyframes: [
      { at: 0.05, point: 0 },
      { at: 0.3, point: 1 },
      { at: 0.5, point: 2 },
      { at: 0.72, point: 3 }
    ],
    program: { sets: 3, reps: 8, restSeconds: 120 },
    model: { url: "/models/Jump Push Up.fbx" },
    placeholder: false
  },
  {
    id: "deadlift",
    name: "\u786C\u62C9",
    nameEn: "Deadlift",
    muscle: "\u80CC\u90E8",
    equipment: "\u6760\u94C3",
    difficulty: "\u9AD8\u7EA7",
    description: "\u5168\u8EAB\u6027\u590D\u5408\u52A8\u4F5C\uFF0C\u91CD\u70B9\u5F3A\u5316\u7AD6\u810A\u808C\u3001\u81C0\u808C\u4E0E\u8158\u7EF3\u808C\u3002",
    keyPoints: [
      "\u6760\u94C3\u8D34\u8FD1\u5C0F\u817F\uFF0C\u53CC\u811A\u4F4D\u4E8E\u6760\u6B63\u4E0B\u65B9",
      "\u5C48\u9ACB\u4E0B\u8E72\u63E1\u6760\uFF0C\u80CC\u90E8\u4FDD\u6301\u4E2D\u7ACB\u633A\u76F4",
      "\u53D1\u529B\u65F6\u811A\u8E6C\u5730\u3001\u9ACB\u90E8\u524D\u63A8\uFF0C\u6760\u94C3\u8D34\u8EAB\u5782\u76F4\u4E0A\u5347",
      "\u9501\u5B9A\u9636\u6BB5\u633A\u80F8\u6536\u80A9\u80DB\uFF0C\u4E0D\u8981\u540E\u4EF0"
    ],
    mistakes: ["\u5F13\u80CC\u62C9\u8D77\uFF08\u8170\u690E\u4EE3\u507F\uFF09", "\u6760\u94C3\u79BB\u8EAB\u4F53\u8FC7\u8FDC", "\u5148\u62AC\u81C0\u5BFC\u81F4\u59FF\u52BF\u53D8\u5F62", "\u9501\u5B9A\u65F6\u523B\u610F\u540E\u4EF0"],
    sets: "3\u20135 \u7EC4 \xD7 5\u20138 \u6B21",
    keyframes: [
      { at: 0.02, point: 0 },
      { at: 0.4, point: 1 },
      { at: 0.62, point: 2 },
      { at: 0.98, point: 3 }
    ],
    errors: [
      { label: "\u5F13\u80CC\u62C9\u8D77\uFF08\u8170\u690E\u4EE3\u507F\uFF09", motionId: "deadlift-x-arch" },
      { label: "\u9501\u5B9A\u65F6\u523B\u610F\u540E\u4EF0", motionId: "deadlift-x-hyper" }
    ],
    program: { sets: 4, reps: 6, restSeconds: 180 },
    model: { url: "/models/Xbot.glb", clip: "deadlift" },
    generated: true
  },
  {
    id: "plank",
    name: "\u5E73\u677F\u652F\u6491",
    nameEn: "Plank",
    muscle: "\u6838\u5FC3",
    equipment: "\u81EA\u91CD",
    difficulty: "\u521D\u7EA7",
    description: "\u6838\u5FC3\u7B49\u957F\u6536\u7F29\u8BAD\u7EC3\uFF0C\u63D0\u5347\u8EAF\u5E72\u7A33\u5B9A\u4E0E\u6297\u4F38\u5C55\u80FD\u529B\u3002",
    keyPoints: [
      "\u524D\u81C2\u6491\u5730\uFF0C\u8098\u90E8\u4F4D\u4E8E\u80A9\u8180\u6B63\u4E0B\u65B9",
      "\u5934\u3001\u80A9\u3001\u9ACB\u3001\u8E1D\u5448\u4E00\u6761\u76F4\u7EBF",
      "\u6536\u7D27\u8179\u90E8\u4E0E\u81C0\u90E8\uFF0C\u907F\u514D\u8170\u90E8\u4E0B\u6C89",
      "\u4FDD\u6301\u5747\u5300\u547C\u5438\uFF0C\u4E0D\u8981\u618B\u6C14"
    ],
    mistakes: ["\u8170\u90E8\u4E0B\u6C89\u584C\u9677", "\u81C0\u90E8\u62AC\u5F97\u8FC7\u9AD8", "\u618B\u6C14\u786C\u6491", "\u8098\u90E8\u4F4D\u7F6E\u8FC7\u524D\u6216\u8FC7\u540E"],
    sets: "3 \u7EC4 \xD7 30\u201360 \u79D2",
    keyframes: [{ at: 0.5, point: 1 }],
    errors: [{ label: "\u8170\u90E8\u4E0B\u6C89\u584C\u9677", motionId: "plank-x-sag" }],
    compareMotion: "plank",
    program: { sets: 3, seconds: 45, restSeconds: 60 },
    model: { url: "/models/Plank.fbx" },
    placeholder: false
  },
  {
    id: "lunge",
    name: "\u5F13\u6B65\u8E72",
    nameEn: "Lunge",
    muscle: "\u817F\u90E8",
    equipment: "\u81EA\u91CD / \u54D1\u94C3",
    difficulty: "\u521D\u7EA7",
    description: "\u5355\u4FA7\u817F\u90E8\u8BAD\u7EC3\uFF0C\u6539\u5584\u5DE6\u53F3\u808C\u529B\u5E73\u8861\u4E0E\u9ACB\u5173\u8282\u7A33\u5B9A\u6027\u3002",
    keyPoints: [
      "\u5411\u524D\u8FC8\u5927\u6B65\uFF0C\u53CC\u811A\u524D\u540E\u5F00\u7ACB\u7AD9\u7A33",
      "\u5782\u76F4\u4E0B\u8E72\u81F3\u524D\u540E\u819D\u5747\u7EA6 90\xB0",
      "\u524D\u819D\u5BF9\u51C6\u811A\u5C16\u3001\u4E0D\u8D85\u8FC7\u811A\u5C16\u8FC7\u591A",
      "\u8EAF\u5E72\u4FDD\u6301\u76F4\u7ACB\uFF0C\u91CD\u5FC3\u5C45\u4E2D"
    ],
    mistakes: ["\u524D\u819D\u5185\u6263", "\u6B65\u5E45\u8FC7\u5C0F\u5BFC\u81F4\u819D\u538B\u8FC7\u5927", "\u8EAF\u5E72\u524D\u503E\u8FC7\u591A", "\u540E\u811A\u4E0D\u7A33\u3001\u8EAB\u4F53\u6643\u52A8"],
    sets: "3 \u7EC4 \xD7 \u6BCF\u4FA7 10\u201312 \u6B21",
    keyframes: [
      { at: 0.22, point: 0 },
      { at: 0.33, point: 1 },
      { at: 0.42, point: 2 },
      { at: 0.5, point: 3 }
    ],
    program: { sets: 3, reps: 10, restSeconds: 90 },
    model: { url: "/models/Xbot.glb", clip: "lunge" },
    generated: true
  },
  {
    id: "bicep-curl",
    name: "\u54D1\u94C3\u5F2F\u4E3E",
    nameEn: "Dumbbell Bicep Curl",
    muscle: "\u624B\u81C2",
    equipment: "\u54D1\u94C3",
    difficulty: "\u521D\u7EA7",
    description: "\u5B64\u7ACB\u523A\u6FC0\u80B1\u4E8C\u5934\u808C\u7684\u7ECF\u5178\u624B\u81C2\u52A8\u4F5C\u3002",
    keyPoints: [
      "\u5927\u81C2\u8D34\u7D27\u8EAB\u4F53\u4E24\u4FA7\uFF0C\u8098\u90E8\u56FA\u5B9A\u4E0D\u52A8",
      "\u53D1\u529B\u5F2F\u4E3E\u81F3\u54D1\u94C3\u63A5\u8FD1\u80A9\u90E8",
      "\u9876\u5CF0\u6536\u7F29\u7A0D\u4F5C\u505C\u987F",
      "\u7F13\u6162\u4E0B\u653E\u81F3\u624B\u81C2\u63A5\u8FD1\u4F38\u76F4"
    ],
    mistakes: ["\u7529\u52A8\u8EAB\u4F53\u501F\u529B", "\u8098\u90E8\u524D\u540E\u79FB\u52A8", "\u4E0B\u653E\u8FC7\u5FEB\u5931\u53BB\u5F20\u529B", "\u624B\u8155\u8FC7\u5EA6\u5F2F\u66F2"],
    sets: "3 \u7EC4 \xD7 10\u201315 \u6B21",
    keyframes: [
      { at: 0.05, point: 0 },
      { at: 0.36, point: 1 },
      { at: 0.52, point: 2 },
      { at: 0.85, point: 3 }
    ],
    errors: [{ label: "\u7529\u52A8\u8EAB\u4F53\u501F\u529B", motionId: "bicep-curl-x-swing" }],
    program: { sets: 3, reps: 12, restSeconds: 60 },
    model: { url: "/models/Xbot.glb", clip: "bicep-curl" },
    generated: true
  },
  {
    id: "sit-up",
    name: "\u4EF0\u5367\u8D77\u5750",
    nameEn: "Sit-Up",
    muscle: "\u6838\u5FC3",
    equipment: "\u81EA\u91CD",
    difficulty: "\u521D\u7EA7",
    description: "\u57FA\u7840\u8179\u90E8\u8BAD\u7EC3\uFF0C\u5F3A\u5316\u8179\u76F4\u808C\u3002",
    keyPoints: [
      "\u5C48\u819D\u4EF0\u5367\uFF0C\u53CC\u811A\u56FA\u5B9A\u8E29\u5B9E",
      "\u53CC\u624B\u8F7B\u653E\u8033\u4FA7\u6216\u80F8\u524D\uFF0C\u4E0D\u62B1\u5934\u62C9\u9888",
      "\u7528\u8179\u90E8\u529B\u91CF\u5377\u8D77\u4E0A\u534A\u8EAB",
      "\u7F13\u6162\u4E0B\u653E\uFF0C\u63A7\u5236\u79BB\u5FC3\u8FC7\u7A0B"
    ],
    mistakes: ["\u53CC\u624B\u62B1\u5934\u731B\u62C9\u9888\u90E8", "\u501F\u52A9\u60EF\u6027\u5F39\u8D77", "\u8170\u90E8\u60AC\u7A7A\u5F13\u8D77", "\u4E0B\u653E\u65F6\u5B8C\u5168\u653E\u677E\u7838\u5730"],
    sets: "3 \u7EC4 \xD7 15\u201320 \u6B21",
    keyframes: [
      { at: 0.02, point: 0 },
      { at: 0.2, point: 1 },
      { at: 0.38, point: 2 },
      { at: 0.85, point: 3 }
    ],
    program: { sets: 3, reps: 15, restSeconds: 60 },
    model: { url: "/models/Xbot.glb", clip: "sit-up" },
    generated: true,
    camera: "floor"
  },
  {
    id: "jumping-jack",
    name: "\u5F00\u5408\u8DF3",
    nameEn: "Jumping Jack",
    muscle: "\u5168\u8EAB",
    equipment: "\u81EA\u91CD",
    difficulty: "\u521D\u7EA7",
    description: "\u9AD8\u6548\u70ED\u8EAB\u6709\u6C27\u52A8\u4F5C\uFF0C\u5FEB\u901F\u63D0\u5347\u5FC3\u7387\u4E0E\u5168\u8EAB\u534F\u8C03\u6027\u3002",
    keyPoints: [
      "\u8DF3\u8D77\u65F6\u53CC\u811A\u5411\u4E24\u4FA7\u6253\u5F00\uFF0C\u53CC\u624B\u5934\u9876\u51FB\u638C",
      "\u843D\u5730\u65F6\u524D\u811A\u638C\u5148\u7740\u5730\u3001\u819D\u76D6\u5FAE\u5C48\u7F13\u51B2",
      "\u4FDD\u6301\u8282\u594F\u5747\u5300\u3001\u547C\u5438\u914D\u5408",
      "\u6838\u5FC3\u5FAE\u6536\uFF0C\u8EAF\u5E72\u7A33\u5B9A\u4E0D\u6643\u52A8"
    ],
    mistakes: ["\u843D\u5730\u65F6\u819D\u76D6\u5B8C\u5168\u9501\u6B7B", "\u52A8\u4F5C\u677E\u6563\u3001\u624B\u811A\u4E0D\u540C\u6B65", "\u5168\u811A\u638C\u91CD\u843D\u5730\u51B2\u51FB\u5173\u8282", "\u901F\u5EA6\u5FFD\u5FEB\u5FFD\u6162"],
    sets: "3 \u7EC4 \xD7 30\u201360 \u79D2",
    keyframes: [
      { at: 0.05, point: 0 },
      { at: 0.25, point: 3 },
      { at: 0.5, point: 1 },
      { at: 0.95, point: 2 }
    ],
    program: { sets: 3, seconds: 40, restSeconds: 30 },
    model: { url: "/models/Jumping Jacks.fbx" },
    placeholder: false
  },
  {
    id: "bench-press",
    name: "\u6760\u94C3\u5367\u63A8",
    nameEn: "Bench Press",
    muscle: "\u80F8\u90E8",
    equipment: "\u6760\u94C3",
    difficulty: "\u4E2D\u7EA7",
    description: "\u4E0A\u80A2\u529B\u91CF\u738B\u724C\u52A8\u4F5C\uFF0C\u53D1\u5C55\u80F8\u5927\u808C\u539A\u5EA6\u4E0E\u63A8\u4E3E\u529B\u91CF\u3002",
    keyPoints: [
      "\u4EF0\u5367\u51F3\u4E0A\uFF0C\u53CC\u811A\u8E29\u5B9E\u5730\u9762\uFF0C\u81C0\u90E8\u8D34\u51F3",
      "\u63E1\u8DDD\u7565\u5BBD\u4E8E\u80A9\uFF0C\u624B\u8155\u4E2D\u7ACB\u4E0D\u540E\u7FFB",
      "\u4E0B\u653E\u6760\u94C3\u81F3\u4E73\u5934\u9644\u8FD1\uFF0C\u8098\u90E8\u7EA6 75\xB0",
      "\u63A8\u8D77\u65F6\u80A9\u80DB\u6536\u7D27\u3001\u80CC\u90E8\u5FAE\u5F13\uFF08\u8D77\u6865\uFF09"
    ],
    mistakes: ["\u624B\u8155\u8FC7\u5EA6\u540E\u7FFB\u53D7\u538B", "\u8098\u90E8\u5B8C\u5168\u5916\u5C55 90\xB0", "\u6760\u94C3\u4E0B\u653E\u4F4D\u7F6E\u8FC7\u9AD8\uFF08\u7838\u5411\u8116\u5B50\uFF09", "\u81C0\u90E8\u79BB\u51F3\u501F\u529B"],
    sets: "3\u20134 \u7EC4 \xD7 8\u201312 \u6B21",
    keyframes: [
      { at: 0.02, point: 0 },
      { at: 0.15, point: 1 },
      { at: 0.35, point: 2 },
      { at: 0.9, point: 3 }
    ],
    errors: [{ label: "\u8098\u90E8\u5B8C\u5168\u5916\u5C55 90\xB0", motionId: "bench-press-x-flare" }],
    program: { sets: 4, reps: 10, restSeconds: 120 },
    model: { url: "/models/Xbot.glb", clip: "bench-press" },
    generated: true,
    camera: "floor"
  },
  {
    id: "pull-up",
    name: "\u5F15\u4F53\u5411\u4E0A",
    nameEn: "Pull-Up",
    muscle: "\u80CC\u90E8",
    equipment: "\u5355\u6760",
    difficulty: "\u9AD8\u7EA7",
    description: "\u80CC\u90E8\u5BBD\u5EA6\u8BAD\u7EC3\u9EC4\u91D1\u52A8\u4F5C\uFF0C\u5F3A\u5316\u80CC\u9614\u808C\u4E0E\u80B1\u4E8C\u5934\u808C\u3002",
    keyPoints: [
      "\u6B63\u63E1\u7565\u5BBD\u4E8E\u80A9\uFF0C\u5168\u7A0B\u6838\u5FC3\u6536\u7D27",
      "\u542F\u52A8\u65F6\u5148\u4E0B\u6C89\u80A9\u80DB\u518D\u53D1\u529B\u62C9\u8D77",
      "\u62C9\u81F3\u4E0B\u5DF4\u8FC7\u6760",
      "\u7F13\u6162\u4E0B\u653E\u81F3\u624B\u81C2\u63A5\u8FD1\u4F38\u76F4\uFF0C\u63A7\u5236\u79BB\u5FC3"
    ],
    mistakes: ["\u7529\u8170\u6446\u817F\u501F\u529B\uFF08\u975E\u523B\u610F\u8776\u5F0F\uFF09", "\u4E0B\u653E\u4E0D\u5B8C\u5168\u3001\u53EA\u505A\u534A\u7A0B", "\u8038\u80A9\u7F29\u8116\u3001\u80A9\u80DB\u672A\u542F\u52A8", "\u63E1\u8DDD\u8FC7\u5BBD\u9650\u5236\u5E45\u5EA6"],
    sets: "3 \u7EC4 \xD7 6\u201310 \u6B21",
    keyframes: [
      { at: 0.03, point: 0 },
      { at: 0.2, point: 1 },
      { at: 0.37, point: 2 },
      { at: 0.85, point: 3 }
    ],
    program: { sets: 3, reps: 6, restSeconds: 150 },
    model: { url: "/models/Xbot.glb", clip: "pull-up" },
    generated: true
  },
  {
    id: "overhead-press",
    name: "\u7AD9\u59FF\u80A9\u63A8",
    nameEn: "Overhead Press",
    muscle: "\u80A9\u90E8",
    equipment: "\u6760\u94C3 / \u54D1\u94C3",
    difficulty: "\u4E2D\u7EA7",
    description: "\u53D1\u5C55\u4E09\u89D2\u808C\u4E0E\u4E0A\u80A2\u5782\u76F4\u63A8\u529B\u7684\u6838\u5FC3\u52A8\u4F5C\u3002",
    keyPoints: [
      "\u6760\u94C3\u7F6E\u4E8E\u9501\u9AA8\u4E0A\u65B9\uFF0C\u63E1\u8DDD\u7565\u5BBD\u4E8E\u80A9",
      "\u6536\u7D27\u6838\u5FC3\u4E0E\u81C0\u90E8\uFF0C\u808B\u9AA8\u4E0D\u5916\u7FFB",
      "\u5782\u76F4\u5411\u4E0A\u63A8\u81F3\u624B\u81C2\u4F38\u76F4\uFF0C\u5934\u90E8\u7A0D\u8BA9\u4F4D",
      "\u4E0B\u653E\u63A7\u5236\u56DE\u5230\u8D77\u59CB\u4F4D"
    ],
    mistakes: ["\u8FC7\u5EA6\u633A\u8170\u501F\u529B\uFF08\u8170\u690E\u53D7\u538B\uFF09", "\u63A8\u8D77\u65F6\u6760\u94C3\u524D\u79FB\u7ED5\u5934", "\u63E1\u8DDD\u8FC7\u7A84\u6216\u8FC7\u5BBD", "\u9501\u5B9A\u65F6\u523B\u610F\u8038\u80A9"],
    sets: "3\u20134 \u7EC4 \xD7 8\u201312 \u6B21",
    keyframes: [
      { at: 0.03, point: 0 },
      { at: 0.15, point: 1 },
      { at: 0.4, point: 2 },
      { at: 0.9, point: 3 }
    ],
    program: { sets: 4, reps: 10, restSeconds: 90 },
    model: { url: "/models/Xbot.glb", clip: "overhead-press" },
    generated: true
  },
  {
    id: "burpee",
    name: "\u6CE2\u6BD4\u8DF3",
    nameEn: "Burpee",
    muscle: "\u5168\u8EAB",
    equipment: "\u81EA\u91CD",
    difficulty: "\u4E2D\u7EA7",
    description: "\u9AD8\u5F3A\u5EA6\u5168\u8EAB\u52A8\u4F5C\u3002\u6F14\u793A\u91CC\u662F\u4E0B\u8E72\u4F38\u624B\u63A5\u7206\u53D1\u8D77\u8DF3\uFF0C\u5B8C\u6574\u7248\u8FD8\u53EF\u4EE5\u5728\u4E2D\u95F4\u52A0\u4E00\u6BB5\u5E73\u677F\u6491\u3002",
    keyPoints: [
      "\u5C48\u9ACB\u5C48\u819D\u4E0B\u8E72\uFF0C\u53CC\u624B\u5411\u5730\u9762\u4F38\u51FA",
      "\u6838\u5FC3\u6536\u7D27\uFF0C\u819D\u76D6\u59CB\u7EC8\u5BF9\u51C6\u811A\u5C16",
      "\u8E6C\u5730\u8DF3\u8D77\uFF0C\u53CC\u81C2\u6446\u8FC7\u5934\u9876",
      "\u524D\u811A\u638C\u843D\u5730\uFF0C\u5C48\u819D\u7F13\u51B2\u540E\u518D\u63A5\u4E0B\u4E00\u6B21"
    ],
    mistakes: ["\u4E0B\u8E72\u65F6\u584C\u8170", "\u843D\u5730\u65F6\u819D\u76D6\u9501\u6B7B\u65E0\u7F13\u51B2", "\u8D77\u8DF3\u524D\u6CA1\u6709\u8E72\u7A33", "\u4E3A\u8FFD\u6C42\u9AD8\u5EA6\u727A\u7272\u59FF\u52BF"],
    sets: "3 \u7EC4 \xD7 10\u201315 \u6B21",
    keyframes: [
      { at: 0.08, point: 0 },
      { at: 0.29, point: 1 },
      { at: 0.54, point: 2 },
      { at: 0.71, point: 3 }
    ],
    program: { sets: 3, reps: 12, restSeconds: 90 },
    model: { url: "/models/Xbot.glb", clip: "burpee" },
    generated: true
  },
  {
    id: "romanian-deadlift",
    name: "\u7F57\u9A6C\u5C3C\u4E9A\u786C\u62C9",
    nameEn: "Romanian Deadlift",
    muscle: "\u817F\u90E8",
    equipment: "\u6760\u94C3 / \u54D1\u94C3",
    difficulty: "\u4E2D\u7EA7",
    description: "\u4EE5\u9ACB\u94F0\u94FE\u4E3A\u4E3B\u7684\u540E\u94FE\u52A8\u4F5C\uFF0C\u91CD\u70B9\u62C9\u957F\u5E76\u5F3A\u5316\u8158\u7EF3\u808C\u4E0E\u81C0\u5927\u808C\u3002",
    keyPoints: [
      "\u819D\u5173\u8282\u5FAE\u5C48\u5E76\u4FDD\u6301\u89D2\u5EA6\u57FA\u672C\u4E0D\u53D8",
      "\u9ACB\u90E8\u5411\u540E\u63A8\uFF0C\u6760\u94C3\u8D34\u7740\u5927\u817F\u4E0B\u6ED1",
      "\u80CC\u90E8\u4E2D\u7ACB\uFF0C\u4E0B\u653E\u5230\u80FD\u611F\u5230\u8158\u7EF3\u808C\u7275\u62C9",
      "\u4EE5\u9ACB\u90E8\u524D\u63A8\u7AD9\u76F4\uFF0C\u9876\u5CF0\u6536\u7D27\u81C0\u90E8"
    ],
    mistakes: ["\u53D8\u6210\u6DF1\u8E72\u3001\u819D\u76D6\u5F2F\u66F2\u8FC7\u591A", "\u5F13\u80CC\u8FFD\u6C42\u4E0B\u653E\u6DF1\u5EA6", "\u6760\u94C3\u79BB\u5F00\u817F\u90E8", "\u7AD9\u76F4\u65F6\u8170\u90E8\u8FC7\u5EA6\u540E\u4EF0"],
    sets: "3\u20134 \u7EC4 \xD7 8\u201312 \u6B21",
    keyframes: [
      { at: 0.05, point: 0 },
      { at: 0.42, point: 1 },
      { at: 0.58, point: 2 },
      { at: 0.98, point: 3 }
    ],
    program: { sets: 3, reps: 10, restSeconds: 120 },
    model: { url: "/models/Xbot.glb", clip: "romanian-deadlift" },
    generated: true
  },
  {
    id: "good-morning",
    name: "\u65E9\u5B89\u5F0F\u4F53\u524D\u5C48",
    nameEn: "Good Morning",
    muscle: "\u80CC\u90E8",
    equipment: "\u6760\u94C3 / \u81EA\u91CD",
    difficulty: "\u4E2D\u7EA7",
    description: "\u6760\u94C3\u7F6E\u4E8E\u4E0A\u80CC\u7684\u9ACB\u94F0\u94FE\u7EC3\u4E60\uFF0C\u5F3A\u5316\u7AD6\u810A\u808C\u3001\u81C0\u808C\u4E0E\u8158\u7EF3\u808C\u3002",
    keyPoints: [
      "\u6760\u94C3\u7A33\u5B9A\u5728\u4E0A\u80CC\uFF0C\u53CC\u624B\u6276\u6760\uFF0C\u4E0D\u538B\u9888",
      "\u819D\u5FAE\u5C48\uFF0C\u9ACB\u90E8\u540E\u5750\u5E26\u52A8\u8EAF\u5E72\u524D\u503E",
      "\u4E0B\u653E\u5230\u8EAF\u5E72\u63A5\u8FD1\u4E0E\u5730\u9762\u5E73\u884C",
      "\u81C0\u808C\u53D1\u529B\u5C06\u9ACB\u63A8\u56DE\uFF0C\u8EAF\u5E72\u56DE\u5230\u76F4\u7ACB"
    ],
    mistakes: ["\u5F13\u80CC\u4F4E\u5934", "\u819D\u76D6\u5F2F\u66F2\u8FC7\u591A\u505A\u6210\u6DF1\u8E72", "\u91CD\u91CF\u538B\u5728\u9888\u690E\u4E0A", "\u5E45\u5EA6\u8FC7\u5927\u5BFC\u81F4\u8170\u690E\u5931\u7A33"],
    sets: "3 \u7EC4 \xD7 8\u201312 \u6B21",
    keyframes: [
      { at: 0.03, point: 0 },
      { at: 0.2, point: 1 },
      { at: 0.42, point: 2 },
      { at: 0.9, point: 3 }
    ],
    errors: [{ label: "\u5F13\u80CC\u4F4E\u5934", motionId: "good-morning-x-arch" }],
    program: { sets: 3, reps: 10, restSeconds: 120 },
    model: { url: "/models/Xbot.glb", clip: "good-morning" },
    generated: true
  },
  {
    id: "bent-over-row",
    name: "\u4FEF\u8EAB\u5212\u8239",
    nameEn: "Bent-Over Row",
    muscle: "\u80CC\u90E8",
    equipment: "\u6760\u94C3 / \u54D1\u94C3",
    difficulty: "\u4E2D\u7EA7",
    description: "\u8EAF\u5E72\u524D\u503E\u4F4D\u4E0B\u7684\u6C34\u5E73\u62C9\uFF0C\u53D1\u5C55\u80CC\u9614\u808C\u539A\u5EA6\u3001\u83F1\u5F62\u808C\u4E0E\u540E\u675F\u3002",
    keyPoints: [
      "\u9ACB\u94F0\u94FE\u4F7F\u8EAF\u5E72\u63A5\u8FD1\u6C34\u5E73\uFF0C\u6838\u5FC3\u6536\u7D27",
      "\u6760\u94C3\u4ECE\u819D\u4E0B\u65B9\u5411\u8179\u90E8\u62C9\u8D77",
      "\u62C9\u8D77\u65F6\u80A9\u80DB\u540E\u7F29\uFF0C\u8098\u90E8\u8D34\u8FD1\u8EAF\u5E72",
      "\u4E0B\u653E\u65F6\u624B\u81C2\u4F38\u76F4\uFF0C\u4FDD\u6301\u80CC\u90E8\u5F20\u529B"
    ],
    mistakes: ["\u7528\u7529\u8170\u60EF\u6027\u62C9\u8D77", "\u8EAF\u5E72\u8D77\u8D77\u4F0F\u4F0F", "\u8098\u90E8\u8FC7\u5EA6\u5916\u5C55", "\u542B\u80F8\u5706\u80CC"],
    sets: "3\u20134 \u7EC4 \xD7 8\u201312 \u6B21",
    keyframes: [
      { at: 0.05, point: 0 },
      { at: 0.36, point: 1 },
      { at: 0.5, point: 2 },
      { at: 0.9, point: 3 }
    ],
    program: { sets: 4, reps: 10, restSeconds: 90 },
    model: { url: "/models/Xbot.glb", clip: "bent-over-row" },
    generated: true
  },
  {
    id: "rear-delt-fly",
    name: "\u4FEF\u8EAB\u98DE\u9E1F",
    nameEn: "Rear Delt Fly",
    muscle: "\u80A9\u90E8",
    equipment: "\u54D1\u94C3",
    difficulty: "\u521D\u7EA7",
    description: "\u5B64\u7ACB\u523A\u6FC0\u4E09\u89D2\u808C\u540E\u675F\u4E0E\u80A9\u80DB\u7A33\u5B9A\u808C\uFF0C\u6539\u5584\u542B\u80F8\u5706\u80A9\u3002",
    keyPoints: [
      "\u9ACB\u94F0\u94FE\uFF0C\u8EAF\u5E72\u63A5\u8FD1\u6C34\u5E73\uFF0C\u819D\u5FAE\u5C48",
      "\u8098\u90E8\u5FAE\u5C48\u5E76\u56FA\u5B9A\u89D2\u5EA6\uFF0C\u5411\u4E24\u4FA7\u62AC\u8D77",
      "\u62AC\u5230\u4E0A\u81C2\u4E0E\u80CC\u90E8\u7EA6\u540C\u4E00\u5E73\u9762",
      "\u9876\u5CF0\u505C\u987F\u540E\u7F13\u6162\u4E0B\u653E"
    ],
    mistakes: ["\u91CD\u91CF\u8FC7\u5927\u53D8\u6210\u5212\u8239", "\u8038\u80A9\u4EE3\u507F", "\u8EAF\u5E72\u8DDF\u7740\u7529\u52A8", "\u624B\u81C2\u5B8C\u5168\u4F38\u76F4\u9501\u6B7B\u8098\u5173\u8282"],
    sets: "3 \u7EC4 \xD7 12\u201315 \u6B21",
    keyframes: [
      { at: 0.05, point: 0 },
      { at: 0.36, point: 1 },
      { at: 0.5, point: 2 },
      { at: 0.9, point: 3 }
    ],
    program: { sets: 3, reps: 12, restSeconds: 60 },
    model: { url: "/models/Xbot.glb", clip: "rear-delt-fly" },
    generated: true
  },
  {
    id: "lateral-raise",
    name: "\u54D1\u94C3\u4FA7\u5E73\u4E3E",
    nameEn: "Dumbbell Lateral Raise",
    muscle: "\u80A9\u90E8",
    equipment: "\u54D1\u94C3",
    difficulty: "\u521D\u7EA7",
    description: "\u5B64\u7ACB\u4E09\u89D2\u808C\u4E2D\u675F\u7684\u7ECF\u5178\u52A8\u4F5C\uFF0C\u7528\u6765\u589E\u52A0\u80A9\u90E8\u5BBD\u5EA6\u3002",
    keyPoints: [
      "\u8098\u90E8\u5FAE\u5C48\uFF0C\u54D1\u94C3\u7F6E\u4E8E\u4F53\u4FA7",
      "\u8098\u90E8\u5FAE\u5C48\u56FA\u5B9A\uFF0C\u5411\u4E24\u4FA7\u62AC\u5230\u4E0A\u81C2\u4E0E\u80A9\u540C\u9AD8",
      "\u638C\u5FC3\u5411\u4E0B\u6216\u7A0D\u5411\u524D\uFF0C\u4E0D\u8981\u8038\u80A9",
      "\u7F13\u6162\u4E0B\u653E\uFF0C\u4FDD\u6301\u4E2D\u675F\u6301\u7EED\u5F20\u529B"
    ],
    mistakes: ["\u7529\u52A8\u8EAB\u4F53\u501F\u529B", "\u62AC\u8FC7\u5934\u9876\u53D8\u6210\u659C\u65B9\u808C\u53D1\u529B", "\u624B\u8155\u9AD8\u4E8E\u8098\u90E8", "\u4E0B\u653E\u65F6\u5B8C\u5168\u653E\u677E"],
    sets: "3 \u7EC4 \xD7 12\u201315 \u6B21",
    keyframes: [
      { at: 0.05, point: 0 },
      { at: 0.36, point: 1 },
      { at: 0.52, point: 2 },
      { at: 0.85, point: 3 }
    ],
    program: { sets: 3, reps: 12, restSeconds: 60 },
    model: { url: "/models/Xbot.glb", clip: "lateral-raise" },
    generated: true
  },
  {
    id: "front-raise",
    name: "\u54D1\u94C3\u524D\u5E73\u4E3E",
    nameEn: "Dumbbell Front Raise",
    muscle: "\u80A9\u90E8",
    equipment: "\u54D1\u94C3",
    difficulty: "\u521D\u7EA7",
    description: "\u9488\u5BF9\u4E09\u89D2\u808C\u524D\u675F\u7684\u5B64\u7ACB\u62AC\u4E3E\uFF0C\u8F85\u52A9\u63A8\u7C7B\u52A8\u4F5C\u7684\u80A9\u5C48\u66F2\u529B\u91CF\u3002",
    keyPoints: [
      "\u624B\u81C2\u5FAE\u5C48\uFF0C\u54D1\u94C3\u7F6E\u4E8E\u5927\u817F\u524D\u65B9",
      "\u5411\u524D\u62AC\u81F3\u4E0A\u81C2\u4E0E\u5730\u9762\u5E73\u884C",
      "\u8EAF\u5E72\u4FDD\u6301\u76F4\u7ACB\uFF0C\u808B\u9AA8\u4E0D\u8981\u5916\u7FFB",
      "\u63A7\u5236\u79BB\u5FC3\uFF0C\u4E0D\u8981\u76F4\u63A5\u6389\u4E0B\u6765"
    ],
    mistakes: ["\u8EAB\u4F53\u524D\u540E\u6643\u52A8", "\u62AC\u5F97\u8FC7\u9AD8\u8D85\u8FC7\u80A9", "\u8170\u90E8\u8FC7\u5EA6\u540E\u4EF0", "\u8098\u90E8\u5B8C\u5168\u9501\u6B7B"],
    sets: "3 \u7EC4 \xD7 10\u201315 \u6B21",
    keyframes: [
      { at: 0.05, point: 0 },
      { at: 0.36, point: 1 },
      { at: 0.52, point: 2 },
      { at: 0.85, point: 3 }
    ],
    program: { sets: 3, reps: 12, restSeconds: 60 },
    model: { url: "/models/Xbot.glb", clip: "front-raise" },
    generated: true
  },
  {
    id: "tricep-extension",
    name: "\u9888\u540E\u81C2\u5C48\u4F38",
    nameEn: "Overhead Triceps Extension",
    muscle: "\u624B\u81C2",
    equipment: "\u54D1\u94C3",
    difficulty: "\u521D\u7EA7",
    description: "\u4E0A\u81C2\u56FA\u5B9A\u4E8E\u5934\u4FA7\uFF0C\u7528\u8098\u4F38\u5C55\u523A\u6FC0\u80B1\u4E09\u5934\u808C\u957F\u5934\u3002",
    keyPoints: [
      "\u53CC\u81C2\u4E3E\u8FC7\u5934\u9876\uFF0C\u5927\u81C2\u8D34\u4F4F\u8033\u4FA7",
      "\u53EA\u5F2F\u66F2\u8098\u5173\u8282\uFF0C\u524D\u81C2\u5411\u5934\u540E\u843D\u4E0B",
      "\u4F38\u76F4\u65F6\u80B1\u4E09\u5934\u808C\u6536\u7D27\uFF0C\u8098\u4E0D\u9501\u6B7B\u7838\u76F4",
      "\u6838\u5FC3\u6536\u7D27\uFF0C\u907F\u514D\u808B\u9AA8\u5916\u7FFB\u3001\u8170\u90E8\u8D85\u4F38"
    ],
    mistakes: ["\u5927\u81C2\u524D\u540E\u6643\u52A8\u501F\u529B", "\u8098\u90E8\u5411\u5916\u6253\u5F00", "\u4E0B\u653E\u5E45\u5EA6\u4E0D\u591F", "\u7528\u8170\u90E8\u540E\u4EF0\u5B8C\u6210\u4E0A\u4E3E"],
    sets: "3 \u7EC4 \xD7 10\u201315 \u6B21",
    keyframes: [
      { at: 0.03, point: 0 },
      { at: 0.37, point: 1 },
      { at: 0.52, point: 2 },
      { at: 0.8, point: 3 }
    ],
    program: { sets: 3, reps: 12, restSeconds: 60 },
    model: { url: "/models/Xbot.glb", clip: "tricep-extension" },
    generated: true
  },
  {
    id: "calf-raise",
    name: "\u7AD9\u59FF\u63D0\u8E35",
    nameEn: "Standing Calf Raise",
    muscle: "\u817F\u90E8",
    equipment: "\u81EA\u91CD / \u54D1\u94C3",
    difficulty: "\u521D\u7EA7",
    description: "\u8E1D\u5173\u8282\u8DD6\u5C48\u7EC3\u4E60\uFF0C\u5F3A\u5316\u8153\u80A0\u808C\u4E0E\u6BD4\u76EE\u9C7C\u808C\u3002",
    keyPoints: [
      "\u524D\u811A\u638C\u652F\u6491\uFF0C\u8EAB\u4F53\u4FDD\u6301\u4E00\u6761\u76F4\u7EBF",
      "\u5C3D\u53EF\u80FD\u9AD8\u5730\u62AC\u8D77\u811A\u8DDF\uFF0C\u9876\u5CF0\u505C\u987F",
      "\u7F13\u6162\u843D\u4E0B\uFF0C\u628A\u8DDF\u8171\u62C9\u957F",
      "\u819D\u76D6\u4FDD\u6301\u5FAE\u5C48\uFF0C\u4E0D\u8981\u9760\u5F2F\u819D\u501F\u529B"
    ],
    mistakes: ["\u8EAB\u4F53\u524D\u503E\u7528\u4F53\u91CD\u6643\u8D77\u6765", "\u5E45\u5EA6\u53EA\u6709\u4E00\u534A", "\u819D\u76D6\u5927\u5E45\u5F2F\u66F2", "\u901F\u5EA6\u592A\u5FEB\u6CA1\u6709\u9876\u5CF0\u6536\u7F29"],
    sets: "3\u20134 \u7EC4 \xD7 12\u201320 \u6B21",
    keyframes: [
      { at: 0.05, point: 0 },
      { at: 0.35, point: 1 },
      { at: 0.55, point: 2 },
      { at: 0.8, point: 3 }
    ],
    program: { sets: 4, reps: 15, restSeconds: 45 },
    model: { url: "/models/Xbot.glb", clip: "calf-raise" },
    generated: true
  },
  {
    id: "jump-squat",
    name: "\u8DF3\u8DC3\u6DF1\u8E72",
    nameEn: "Jump Squat",
    muscle: "\u817F\u90E8",
    equipment: "\u81EA\u91CD",
    difficulty: "\u4E2D\u7EA7",
    description: "\u5728\u6DF1\u8E72\u672B\u7AEF\u7206\u53D1\u8D77\u8DF3\uFF0C\u53D1\u5C55\u4E0B\u80A2\u529F\u7387\u4E0E\u843D\u5730\u7F13\u51B2\u80FD\u529B\u3002",
    keyPoints: [
      "\u5148\u5B8C\u6210\u4E00\u6B21\u7A33\u5B9A\u7684\u5168\u5E45\u6DF1\u8E72",
      "\u4ECE\u5E95\u90E8\u7206\u53D1\u8E6C\u5730\uFF0C\u624B\u81C2\u914D\u5408\u4E0A\u6446",
      "\u817E\u7A7A\u65F6\u9ACB\u3001\u819D\u3001\u8E1D\u5145\u5206\u4F38\u5C55",
      "\u524D\u811A\u638C\u843D\u5730\uFF0C\u5C48\u9ACB\u5C48\u819D\u5438\u6536\u51B2\u51FB"
    ],
    mistakes: ["\u843D\u5730\u819D\u76D6\u5185\u6263", "\u53EA\u8DF3\u4E0D\u9AD8\u8E72", "\u843D\u5730\u65F6\u819D\u76D6\u9501\u6B7B", "\u542B\u80F8\u5F13\u80CC\u8D77\u8DF3"],
    sets: "3 \u7EC4 \xD7 8\u201312 \u6B21",
    keyframes: [
      { at: 0.35, point: 0 },
      { at: 0.42, point: 1 },
      { at: 0.53, point: 2 },
      { at: 0.72, point: 3 }
    ],
    program: { sets: 3, reps: 10, restSeconds: 90 },
    model: { url: "/models/Xbot.glb", clip: "jump-squat" },
    generated: true
  },
  {
    id: "high-knees",
    name: "\u9AD8\u62AC\u817F",
    nameEn: "High Knees",
    muscle: "\u5168\u8EAB",
    equipment: "\u81EA\u91CD",
    difficulty: "\u521D\u7EA7",
    description: "\u539F\u5730\u8DD1\u52A8\u5F0F\u70ED\u8EAB\uFF0C\u63D0\u5347\u5FC3\u7387\u3001\u9ACB\u5C48\u808C\u529B\u91CF\u4E0E\u8282\u594F\u611F\u3002",
    keyPoints: [
      "\u652F\u6491\u817F\u5FAE\u5C48\uFF0C\u524D\u811A\u638C\u7740\u5730",
      "\u6446\u52A8\u817F\u5927\u817F\u5C3D\u91CF\u62AC\u81F3\u4E0E\u5730\u9762\u5E73\u884C",
      "\u5BF9\u4FA7\u624B\u81C2\u81EA\u7136\u524D\u540E\u6446\u52A8",
      "\u8EAF\u5E72\u76F4\u7ACB\uFF0C\u843D\u5730\u8F7B\u5DE7"
    ],
    mistakes: ["\u8EAB\u4F53\u540E\u4EF0", "\u811A\u638C\u91CD\u7838\u5730\u9762", "\u62AC\u817F\u53EA\u9760\u5C0F\u817F\u6298\u53E0", "\u542B\u80F8\u584C\u8170"],
    sets: "3 \u7EC4 \xD7 20\u201340 \u79D2",
    keyframes: [
      { at: 0.1, point: 0 },
      { at: 0.4, point: 1 },
      { at: 0.65, point: 2 },
      { at: 0.9, point: 3 }
    ],
    program: { sets: 3, seconds: 30, restSeconds: 30 },
    model: { url: "/models/Xbot.glb", clip: "high-knees" },
    generated: true
  },
  {
    id: "thruster",
    name: "\u54D1\u94C3\u633A\u4E3E",
    nameEn: "Dumbbell Thruster",
    muscle: "\u5168\u8EAB",
    equipment: "\u54D1\u94C3",
    difficulty: "\u4E2D\u7EA7",
    description: "\u524D\u8E72\u63A5\u63A8\u4E3E\u7684\u7EC4\u5408\u52A8\u4F5C\uFF0C\u4E00\u6B21\u5B8C\u6210\u4E0B\u80A2\u53D1\u529B\u4E0E\u80A9\u90E8\u4E0A\u63A8\u3002",
    keyPoints: [
      "\u54D1\u94C3\u7F6E\u4E8E\u80A9\u524D\uFF0C\u8098\u671D\u524D\u4E0B\u65B9",
      "\u4E0B\u8E72\u81F3\u5927\u817F\u63A5\u8FD1\u5E73\u884C\uFF0C\u8EAF\u5E72\u5C3D\u91CF\u76F4\u7ACB",
      "\u7AD9\u8D77\u7684\u540C\u65F6\u501F\u817F\u90E8\u529B\u91CF\u628A\u54D1\u94C3\u63A8\u8FC7\u5934\u9876",
      "\u63A8\u76F4\u540E\u63A7\u5236\u653E\u56DE\u80A9\u90E8\uFF0C\u518D\u8FDB\u5165\u4E0B\u4E00\u6B21\u4E0B\u8E72"
    ],
    mistakes: ["\u4E0B\u8E72\u65F6\u4E25\u91CD\u524D\u503E", "\u53EA\u7528\u624B\u81C2\u786C\u63A8\u3001\u817F\u90E8\u6CA1\u6709\u53D1\u529B", "\u63A8\u8D77\u65F6\u8170\u90E8\u8FC7\u5EA6\u540E\u4EF0", "\u54D1\u94C3\u5728\u80A9\u4E0A\u5931\u53BB\u63A7\u5236"],
    sets: "3 \u7EC4 \xD7 8\u201312 \u6B21",
    keyframes: [
      { at: 0.03, point: 0 },
      { at: 0.35, point: 1 },
      { at: 0.56, point: 2 },
      { at: 0.85, point: 3 }
    ],
    program: { sets: 3, reps: 10, restSeconds: 120 },
    model: { url: "/models/Xbot.glb", clip: "thruster" },
    generated: true
  },
  {
    id: "kettlebell-swing",
    name: "\u58F6\u94C3\u6446\u52A8",
    nameEn: "Kettlebell Swing",
    muscle: "\u5168\u8EAB",
    equipment: "\u58F6\u94C3 / \u54D1\u94C3",
    difficulty: "\u4E2D\u7EA7",
    description: "\u9ACB\u94F0\u94FE\u7206\u53D1\u529B\u52A8\u4F5C\uFF0C\u7528\u9ACB\u90E8\u5F39\u632F\u628A\u91CD\u91CF\u6446\u5230\u80F8\u524D\u9AD8\u5EA6\u3002",
    keyPoints: [
      "\u58F6\u94C3\u5728\u53CC\u817F\u4E4B\u95F4\u5411\u540E\u6446\u65F6\uFF0C\u9ACB\u90E8\u540E\u5750",
      "\u80CC\u90E8\u4FDD\u6301\u4E2D\u7ACB\uFF0C\u624B\u81C2\u53EA\u662F\u6302\u94A9",
      "\u9ACB\u90E8\u7206\u53D1\u524D\u63A8\uFF0C\u628A\u91CD\u91CF\u6446\u5230\u7EA6\u80A9\u9AD8",
      "\u9876\u7AEF\u81C0\u817F\u5939\u7D27\uFF0C\u4E0D\u8981\u7528\u624B\u81C2\u4E0A\u4E3E"
    ],
    mistakes: ["\u505A\u6210\u6DF1\u8E72", "\u7528\u624B\u81C2\u628A\u58F6\u94C3\u4E3E\u8D77\u6765", "\u5F13\u80CC\u4E0B\u6446", "\u9876\u7AEF\u8EAB\u4F53\u8FC7\u5EA6\u540E\u4EF0"],
    sets: "3\u20135 \u7EC4 \xD7 10\u201315 \u6B21",
    keyframes: [
      { at: 0.1, point: 1 },
      { at: 0.32, point: 0 },
      { at: 0.52, point: 2 },
      { at: 0.64, point: 3 }
    ],
    program: { sets: 3, reps: 15, restSeconds: 60 },
    model: { url: "/models/Xbot.glb", clip: "kettlebell-swing" },
    generated: true
  },
  {
    id: "crunch",
    name: "\u5377\u8179",
    nameEn: "Crunch",
    muscle: "\u6838\u5FC3",
    equipment: "\u81EA\u91CD",
    difficulty: "\u521D\u7EA7",
    description: "\u5C0F\u5E45\u5EA6\u5C48\u66F2\u80F8\u690E\uFF0C\u96C6\u4E2D\u523A\u6FC0\u8179\u76F4\u808C\uFF0C\u51CF\u5C11\u9ACB\u5C48\u808C\u4EE3\u507F\u3002",
    keyPoints: [
      "\u5C48\u819D\u4EF0\u5367\uFF0C\u4E0B\u80CC\u8F7B\u8D34\u5730\u9762",
      "\u808B\u9AA8\u5411\u9AA8\u76C6\u5377\u8D77\uFF0C\u80A9\u80DB\u79BB\u5F00\u5730\u9762\u5373\u53EF",
      "\u4E0B\u80CC\u4E0D\u8981\u5B8C\u5168\u79BB\u5730",
      "\u7F13\u6162\u8FD8\u539F\uFF0C\u9888\u90E8\u4FDD\u6301\u4E2D\u7ACB"
    ],
    mistakes: ["\u53CC\u624B\u62B1\u5934\u62C9\u8116\u5B50", "\u505A\u6210\u5B8C\u6574\u4EF0\u5367\u8D77\u5750", "\u7528\u60EF\u6027\u5F39\u8D77", "\u618B\u6C14"],
    sets: "3 \u7EC4 \xD7 12\u201320 \u6B21",
    keyframes: [
      { at: 0.05, point: 0 },
      { at: 0.35, point: 1 },
      { at: 0.5, point: 2 },
      { at: 0.85, point: 3 }
    ],
    program: { sets: 3, reps: 15, restSeconds: 45 },
    model: { url: "/models/Xbot.glb", clip: "crunch" },
    generated: true,
    camera: "floor"
  },
  {
    id: "lying-leg-raise",
    name: "\u4EF0\u5367\u4E3E\u817F",
    nameEn: "Lying Leg Raise",
    muscle: "\u6838\u5FC3",
    equipment: "\u81EA\u91CD",
    difficulty: "\u521D\u7EA7",
    description: "\u4EF0\u5367\u62AC\u817F\uFF0C\u5F3A\u5316\u8179\u76F4\u808C\u4E0B\u6CBF\u5E76\u8BAD\u7EC3\u9AA8\u76C6\u540E\u503E\u63A7\u5236\u3002",
    keyPoints: [
      "\u4E0B\u80CC\u538B\u4F4F\u5730\u9762\uFF0C\u53CC\u624B\u53EF\u8F7B\u6276\u8EAB\u4F53\u4E24\u4FA7",
      "\u53CC\u817F\u5E76\u62E2\u4F38\u76F4\u6216\u5FAE\u5C48\uFF0C\u5411\u4E0A\u62AC\u5230\u5782\u76F4",
      "\u4E0B\u653E\u65F6\u63A7\u5236\u901F\u5EA6\uFF0C\u4E0B\u80CC\u4E0D\u62F1\u8D77",
      "\u611F\u5230\u8170\u90E8\u79BB\u5730\u5C31\u7F29\u5C0F\u5E45\u5EA6"
    ],
    mistakes: ["\u4E0B\u80CC\u62F1\u8D77\u79BB\u5F00\u5730\u9762", "\u7528\u7529\u817F\u60EF\u6027", "\u4E0B\u653E\u65F6\u811A\u8DDF\u7838\u5730", "\u618B\u6C14"],
    sets: "3 \u7EC4 \xD7 10\u201315 \u6B21",
    keyframes: [
      { at: 0.03, point: 0 },
      { at: 0.38, point: 1 },
      { at: 0.6, point: 3 },
      { at: 0.85, point: 2 }
    ],
    program: { sets: 3, reps: 12, restSeconds: 45 },
    model: { url: "/models/Xbot.glb", clip: "lying-leg-raise" },
    generated: true,
    camera: "floor"
  },
  {
    id: "russian-twist",
    name: "\u4FC4\u7F57\u65AF\u8F6C\u4F53",
    nameEn: "Russian Twist",
    muscle: "\u6838\u5FC3",
    equipment: "\u81EA\u91CD",
    difficulty: "\u521D\u7EA7",
    description: "\u5750\u59FF\u8F6C\u4F53\uFF0C\u8BAD\u7EC3\u8179\u659C\u808C\u4E0E\u6297\u65CB\u8F6C\u65F6\u7684\u8EAF\u5E72\u63A7\u5236\u3002",
    keyPoints: [
      "\u5C48\u819D\u5750\u7A33\uFF0C\u8EAF\u5E72\u540E\u503E\u7EA6 45\xB0\uFF0C\u4E0B\u80CC\u4FDD\u6301\u4E2D\u7ACB",
      "\u53CC\u624B\u5408\u5341\u6216\u6301\u91CD\uFF0C\u968F\u80F8\u690E\u5DE6\u53F3\u8F6C\u52A8",
      "\u8F6C\u52A8\u6765\u81EA\u80F8\u690E\uFF0C\u4E0D\u662F\u53EA\u7529\u624B\u81C2",
      "\u9AA8\u76C6\u5C3D\u91CF\u4FDD\u6301\u7A33\u5B9A"
    ],
    mistakes: ["\u53EA\u7529\u624B\u81C2\u3001\u80F8\u690E\u4E0D\u52A8", "\u584C\u8170\u5706\u80CC", "\u901F\u5EA6\u8FC7\u5FEB\u5931\u53BB\u63A7\u5236", "\u7528\u8116\u5B50\u5E26\u52A8\u8F6C\u5411"],
    sets: "3 \u7EC4 \xD7 \u6BCF\u4FA7 10\u201316 \u6B21",
    keyframes: [
      { at: 0.1, point: 0 },
      { at: 0.25, point: 1 },
      { at: 0.5, point: 2 },
      { at: 0.75, point: 3 }
    ],
    program: { sets: 3, reps: 12, restSeconds: 45 },
    model: { url: "/models/Xbot.glb", clip: "russian-twist" },
    generated: true,
    camera: "floor"
  }
];

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
var SQUAT_VALGUS = both({
  LeftUpLeg: [-86, -26, -12],
  LeftLeg: [112, -10, -6],
  LeftFoot: [-24, 0, 0],
  Spine: [26, 0, 0],
  Spine1: [8, 0, 0],
  LeftArm: [52, 22, -52],
  LeftForeArm: [0, -52, 0]
});
var PRONE = {
  hips: [0, 8, -2],
  hipsRot: [90, 0, 0]
};
var PRONE_LEGS = both({ LeftUpLeg: [0, 2, 2], LeftLeg: [4, 0, 0], LeftFoot: [10, 0, 0] });
var PUSHUP_TOP = merge(PRONE_LEGS, both({ LeftArm: [0, -84, -6], LeftForeArm: [0, -6, 0], Spine: [2, 0, 0] }));
var PUSHUP_BOTTOM = merge(PRONE_LEGS, both({ LeftArm: [0, -84, -6], LeftForeArm: [0, -92, 0], Spine: [2, 0, 0] }));
var PUSHUP_SAG = merge(PRONE_LEGS, both({ LeftArm: [0, -84, -6], LeftForeArm: [0, -6, 0], Spine: [20, 0, 0], Spine1: [12, 0, 0] }));
var PUSHUP_SAG_BOTTOM = merge(PRONE_LEGS, both({ LeftArm: [0, -84, -6], LeftForeArm: [0, -92, 0], Spine: [20, 0, 0], Spine1: [12, 0, 0] }));
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
    poses: [
      pose(0, STAND),
      pose(0.7, HINGE),
      pose(1.15, merge(STAND, both({ LeftArm: [-78, -12, -76], LeftForeArm: [0, -12, 0], Spine: [-4, 0, 0] }))),
      pose(1.4, merge(STAND, both({ LeftArm: [-78, -12, -76], LeftForeArm: [0, -12, 0] }))),
      pose(2.2, STAND)
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
  }
};
export {
  MOTIONS,
  exercises
};
