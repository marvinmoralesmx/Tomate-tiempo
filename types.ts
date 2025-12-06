export enum TimerMode {
  POMODORO = 'POMODORO',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
}

export interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}
