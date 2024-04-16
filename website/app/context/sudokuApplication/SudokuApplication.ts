import { createContext, useContext } from "react"
import { SudokuApplication } from "./Types"


export const SudokuApplicationContext = createContext<SudokuApplication | null>(null)

export function useSudokuApplicationContext() {
    const sudokuApplication = useContext(SudokuApplicationContext)

    if (sudokuApplication == null) {
        throw new Error("useSudokuApplicationContext must be used with a SudokuApplicationContext")
    }

    return sudokuApplication
}
