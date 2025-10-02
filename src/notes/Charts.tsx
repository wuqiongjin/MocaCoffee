export type NoteType = "Single" | "LDirectional" | "RDirectional" | "Slide" | "Long" | "BPM" | "System";

export interface BaseNote {
  beat: number;
  lane: number;
  subBeat?: number; // 子节拍位置，0表示在节拍线上
  type: NoteType;
}

export interface SingleNote extends BaseNote {
  type: "Single";
  flick?: boolean; // flicker 特殊标记
  skill?: boolean; // 技能音符标记
  charge?: boolean; // 蓄力音符标记
}

export interface LDirectionalNote extends BaseNote {
  type: "LDirectional";
  length: number; // 组合长度 (1-3)
  flick?: boolean; // 是否带flick
  skill?: boolean; // 技能音符标记
  charge?: boolean; // 蓄力音符标记
}

export interface RDirectionalNote extends BaseNote {
  type: "RDirectional";
  length: number; // 组合长度 (1-3)
  flick?: boolean; // 是否带flick
  skill?: boolean; // 技能音符标记
  charge?: boolean; // 蓄力音符标记
}

// SlideNote 和 LongNote 完全等价，都使用connections结构
export interface SlideNote {
  type: "Slide";
  connections: ConnectionNote[];
}

export interface LongNote {
  type: "Long";
  connections: ConnectionNote[];
}

export interface ConnectionNote {
  beat: number;
  lane: number;
  subBeat?: number;
  hidden?: boolean; // 隐藏连接点（用于滑条中间点）
  flick?: boolean; // 连接点是否带flick
  skill?: boolean; // 技能音符标记
  charge?: boolean; // 蓄力音符标记
}

export interface BpmNote {
  type: "BPM";
  beat: number;
  bpm: number;
}

export interface SystemNote {
  type: "System";
  beat: number;
  data: string; // 系统数据
}

export type ChartNote = SingleNote | LDirectionalNote | RDirectionalNote | SlideNote | LongNote | BpmNote | SystemNote;
