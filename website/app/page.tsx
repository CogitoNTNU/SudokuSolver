"use client"
import { useState } from "react"

import { SudokuApplicationContext } from "./context/sudokuApplication/SudokuApplication"
import { SudokuState, SUDOKU_SIZE } from "./context/sudokuApplication/Types"
import { CameraState } from "./components/Camera/Types"
import SudokuApplicationElement from "./components/SudokuApplication/SudokuApplication"
import { LayersModel } from "@tensorflow/tfjs"


export default function Home() {
    const [cameraState, setCameraState] = useState<CameraState>(CameraState.Off)
    const [sudokuState, setSudokuState] = useState<SudokuState>(SudokuState.NotFound)
    const [model, setModel] = useState<LayersModel | null>(null)
    const [sudoku, setSudoku] = useState<Uint8Array>(new Uint8Array(SUDOKU_SIZE))
    const [confidence, setConfidence] = useState<Float32Array>(new Float32Array(SUDOKU_SIZE))
    const [solution, setSolution] = useState<Uint8Array>(new Uint8Array(SUDOKU_SIZE))

    const application = {
        cameraState,
        setCameraState,
        sudokuState,
        setSudokuState,
        model,
        setModel,
        sudoku,
        setSudoku,
        confidence,
        setConfidence,
        solution,
        setSolution
    }

    return (
        <SudokuApplicationContext.Provider value={application}>
            <SudokuApplicationElement />
        </SudokuApplicationContext.Provider>
    )
}
