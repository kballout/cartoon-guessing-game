export type CharacterType = {
  name: string,
  path: string,
  correct: boolean
  // any other properties you might need for characters
}

export enum VALIDATION {
    "INCORRECT",
    "CORRECT",
    "TIMEUP"
}

export enum ANSWERFEEDBACKIMAGE {
    INCORRECT = 'wrong.png',
    CORRECT = 'correct.png',
    TIMEUP = 'timesUp.png'
}

export type Option = {
    name: string,
    validation: VALIDATION
}

export enum GAMESTATUS {
  "LOADING",
  "WAITINGINPUT",
  "LOADINGNEXTROUND",
  "GAMEOVER",
}