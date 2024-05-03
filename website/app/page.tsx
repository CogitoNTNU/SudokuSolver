"use client"
import styles from "./page.module.scss"
import { useState } from "react"
import { LayersModel } from "@tensorflow/tfjs"
import { SudokuApplicationContext } from "./context/sudokuApplication/SudokuApplication"
import { SudokuState, SUDOKU_SIZE } from "./context/sudokuApplication/Types"
import { CameraState } from "./components/Camera/Types"
import Image from 'next/image'
import SudokuApplicationElement from "./components/SudokuApplication/SudokuApplication"


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
            <header className={styles.header}>
                <a className={styles.cogitoLogo} href="https://www.cogito-ntnu.no">
                    <Image src="/cogito_white.svg" width={82} height={70} alt="cogito logo" />
                </a>
                <h1 className={styles.title}>SudokuSolver</h1>
            </header>
            <main className={styles.main}>
                <SudokuApplicationElement />
            </main>
            <footer className={styles.footer}>
                <div className={styles.sudokuLogo}>
                    <Image src="/sudoku_logo.png" width={100} height={100} alt="sudoku logo" />
                    <div className={styles.sudokuLogoText}>
                        <p className={styles.sudokuLogoTitle}>SudokuSolver</p>
                        <p className={styles.sudokuLogoYear}>2024</p>
                    </div>
                </div>
                <div className={styles.info}>
                    <a className={styles.source} href="https://github.com/CogitoNTNU/SudokuSolver">
                        <Image src="/github.svg" width={32} height={32} alt="GitHub logo" />
                        <p>Source Code</p>
                    </a>
                    <p className={styles.description}>SudokuSolver uses a combination of computer vision and digit recognition with a convolutional neural network to look for and solve sudokus.</p>
                </div>
            </footer>
        </SudokuApplicationContext.Provider>
    )
}
