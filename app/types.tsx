export type Character = {
    name: string,
    path: string
}

export enum VALIDATION {
    "INCORRECT",
    "CORRECT",
}

export type Option = {
    name: string,
    validation: VALIDATION
}