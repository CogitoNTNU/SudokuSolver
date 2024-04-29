import { Dispatch, SetStateAction } from "react"
import { LayersModel } from "@tensorflow/tfjs"
import { CameraState } from "@/app/components/Camera/Types"

export interface SudokuApplication {
    cameraState: CameraState,
    setCameraState: Dispatch<SetStateAction<CameraState>>
    sudokuState: SudokuState,
    setSudokuState: Dispatch<SetStateAction<SudokuState>>
    model: LayersModel | null,
    setModel: Dispatch<SetStateAction<LayersModel | null>>,
    sudoku: Uint8Array,
    setSudoku: Dispatch<Uint8Array>,
    solution: Uint8Array
    setSolution: Dispatch<Uint8Array>
}

export enum SudokuState {
    NotFound,
    Solved,
    Lost
}

export const DIGIT_IMAGE_WIDTH = 28
export const DIGIT_IMAGE_HEIGHT = 28
export const DIGIT_IMAGE_SIZE = DIGIT_IMAGE_WIDTH * DIGIT_IMAGE_HEIGHT

export const SUDOKU_HEIGHT = 9
export const SUDOKU_WIDTH = 9
export const SUDOKU_SIZE = SUDOKU_HEIGHT * SUDOKU_WIDTH

export const NUM_CLASSES = 9
