export type Character = {
    name: string,
    path: string
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