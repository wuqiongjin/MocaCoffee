export type NoteType = "Single" | "Slide" | "BPM";

export interface BaseNote {
  beat: number;
  lane: number;
  subBeat?: number; // 子节拍位置，0表示在节拍线上
  type: NoteType;
}

export interface SingleNote extends BaseNote {
  type: "Single";
  flick?: boolean; // flicker 特殊标记
}

export interface SlideNote {
  type: "Slide";
  connections: { beat: number; lane: number; subBeat?: number }[];
}

export interface BpmNote {
  type: "BPM";
  beat: number;
  bpm: number;
}

export type ChartNote = SingleNote | SlideNote | BpmNote;
