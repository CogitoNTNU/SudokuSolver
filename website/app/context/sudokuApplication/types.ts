import { Dispatch, SetStateAction } from "react"
import { CameraState } from "@/app/components/Camera/Types"

export interface SudokuApplication {
    cameraState: CameraState,
    setCameraState: Dispatch<SetStateAction<CameraState>>
    sudokuState: SudokuState,
    setSudokuState: Dispatch<SetStateAction<SudokuState>>
}

export enum SudokuState {
    NotFound,
    IsSolving,
    Solved
}

export const NUMBER_IMAGE_WIDTH = 28
export const NUMBER_IMAGE_HEIGHT = 28
export const NUMBER_IMAGE_SIZE = NUMBER_IMAGE_WIDTH * NUMBER_IMAGE_HEIGHT

export const SUDOKU_HEIGHT = 9
export const SUDOKU_WIDTH = 9
export const SUDOKU_SIZE = SUDOKU_HEIGHT * SUDOKU_WIDTH