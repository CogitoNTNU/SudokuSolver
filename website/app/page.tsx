"use client"
import { useState } from "react"

import { SudokuApplicationContext } from "./context/sudokuApplication/SudokuApplication"
import { SudokuState, SUDOKU_SIZE } from "./context/sudokuApplication/Types"
import { CameraState } from "./components/Camera/Types"
import SudokuApplicationElement from "./components/SudokuApplication/SudokuApplication"


export default function Home() {
    const [cameraState, setCameraState] = useState<CameraState>(CameraState.Off)
    const [sudokuState, setSudokuState] = useState<SudokuState>(SudokuState.NotFound)

    const application = {
        cameraState,
        setCameraState,
        sudokuState,
        setSudokuState,
        model: null,
        sudoku: new Uint8Array(SUDOKU_SIZE),
        probability: new Float32Array(SUDOKU_SIZE),
        solution: new Uint8Array(SUDOKU_SIZE)
    }

    return (
        <SudokuApplicationContext.Provider value={application}>
            <SudokuApplicationElement />
        </SudokuApplicationContext.Provider>
    )
}
