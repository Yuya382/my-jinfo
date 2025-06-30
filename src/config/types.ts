export interface ProjectConfig {
  path: string;
  description: string;
}

export interface ColorScheme {
  success: string;
  error: string;
  info: string;
  warning: string;
}

export interface Preferences {
  dateFormat: string;
  timeFormat: string;
  defaultTags: string[];
  colorScheme: ColorScheme;
}

export interface MemoType {
  key: string;
  label: string;
  description: string;
  emoji: string;
  color: string;
}

export interface Config {
  version: string;
  defaultProject: string;
  projects: Record<string, ProjectConfig>;
  preferences: Preferences;
  memoTypes: MemoType[];
}