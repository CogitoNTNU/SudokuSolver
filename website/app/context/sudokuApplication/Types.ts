import { Dispatch, SetStateAction } from "react"
import { LayersModel } from "@tensorflow/tfjs"
import { CameraState } from "@/app/components/Camera/Types"

export interface SudokuApplication {
    cameraState: CameraState,
    setCameraState: Dispatch<SetStateAction<CameraState>>
    sudokuState: SudokuState,
    setSudokuState: Dispatch<SetStateAction<SudokuState>>
    model: LayersModel | null,
    sudoku: Uint8Array,
    probability: Float32Array,
    solution: Uint8Array
}

export enum SudokuState {
    NotFound,
    IsPredicting,
    IsSolving,
    Solved
}

export const NUMBER_IMAGE_WIDTH = 28
export const NUMBER_IMAGE_HEIGHT = 28
export const NUMBER_IMAGE_SIZE = NUMBER_IMAGE_WIDTH * NUMBER_IMAGE_HEIGHT

export const SUDOKU_HEIGHT = 9
export const SUDOKU_WIDTH = 9
export const SUDOKU_SIZE = SUDOKU_HEIGHT * SUDOKU_WIDTH