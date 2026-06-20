export type ItemTyp =
  | 'likert4'
  | 'ja_nein'
  | 'single'
  | 'multi'
  | 'frei'
  | 'mal_schreib'
  | 'scan'
  | 'projekt_select';

export type Zeitpunkt = 'pre' | 'post' | 'both';

export interface ScaleStufe {
  wert: 1 | 2 | 3 | 4;
  farbe: 'gruen' | 'gelb' | 'orange' | 'rot';
  symbol: string;
  text: string;
}

export interface Scale {
  id: string;
  richtung: string;
  stufen: ScaleStufe[];
  codierung_redundant: string[];
}

export interface SichtbarWenn {
  item: string;
  gleich: string;
}

export interface Flag {
  regel: string;
  aktion: string;
}

export interface Item {
  id: string;
  konstrukt: string;
  typ: ItemTyp;
  zeitpunkt: Zeitpunkt;
  pflicht?: boolean;
  ueberspringbar?: boolean;
  text?: string;
  optionen?: string[];
  liste?: string;
  gate?: boolean;
  sichtbar_wenn?: SichtbarWenn;
  polung?: '+' | '-';
  max_eintraege?: number;
  flag?: Flag;
  farbwahl?: boolean;
  hinweis?: string;
  messung?: string;
  analog?: string;
  quelle?: string;
  filter?: string;
  steuert?: string;
  rolle?: string;
  indikator?: string;
  neu?: boolean;
  theorie?: string;
  pre_post_kern?: boolean;
  datenschutz?: string;
  vergleich?: string;
  codier_hinweis?: string[];
  rechtsgrundlage?: boolean;
}

export interface Construct {
  code: string;
  label: string;
  theorie: string;
  zweck: string;
}

export interface Instrument {
  schema_version: string;
  instrument: string;
  titel: string;
  sprache: string;
  hinweise: Record<string, unknown>;
  scale: Scale;
  lists: Record<string, string[]>;
  constructs: Construct[];
  meta_items: string[];
  items: Item[];
  forms: {
    pre: string[];
    post: string[];
  };
  auswertung: Record<string, unknown>;
}

// Answer types per item type
export type LikertAnswer = 1 | 2 | 3 | 4;
export type JaNeinAnswer = 'ja' | 'nein';
export type SingleAnswer = string;
export type MultiAnswer = string[];
export type FreiAnswer = string[];
export type MalSchreibAnswer = { text?: string; drawing?: string; farben_genutzt: number };
export type ScanAnswer = boolean;

export type AnswerValue =
  | LikertAnswer
  | JaNeinAnswer
  | SingleAnswer
  | MultiAnswer
  | FreiAnswer
  | MalSchreibAnswer
  | ScanAnswer;

export type Answers = Record<string, AnswerValue>;

// Mock project (M1 – backend ab M2)
export interface Projekt {
  id: string;
  name: string;
  aktiv: boolean;
  traeger?: string;
}

// App flow phases
export type AppPhase =
  | 'meta_projekt'
  | 'meta_zeitpunkt'
  | 'meta_consent'
  | 'form'
  | 'done';
