"use client"
import styles from "./page.module.scss"
import { useRef, useState, useEffect, useCallback } from "react"
import CameraFeed from "./components/Camera/CameraFeed"
import CameraButton from "./components/Camera/CameraButton"
import { SudokuApplicationContext } from "./context/sudokuApplication/SudokuApplication"
import { SudokuState, SUDOKU_SIZE } from "./context/sudokuApplication/Types"
import { CameraState } from "./components/Camera/Types" 
import { loadLayersModel, LayersModel } from "@tensorflow/tfjs"
import { drawVideoOnCanvas } from "./util/image"

export default function Home() {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const transformedCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const solutionCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const transformedSolutionCanvasRef = useRef<HTMLCanvasElement | null>(null)

    const [cameraState, setCameraState] = useState<CameraState>(CameraState.Off)
    const [sudokuState, setSudokuState] = useState<SudokuState>(SudokuState.NotFound)
    const [model, setModel] = useState<LayersModel | null>(null)
    
    const application = {
        cameraState,
        setCameraState,
        sudokuState,
        setSudokuState,
        model,
        setModel,
        sudoku: new Uint8Array(SUDOKU_SIZE),
        probability: new Float32Array(SUDOKU_SIZE),
        solution: new Uint8Array(SUDOKU_SIZE)
    }
    

    const callbackFunction = useCallback(model ? () => {
        drawVideoOnCanvas(videoRef, canvasRef, application, transformedCanvasRef, solutionCanvasRef, transformedSolutionCanvasRef)
    } : () => {}, [model])
    

    const loadModel = useCallback(() => {
        loadLayersModel('/models/model/model.json').then(loadedModel => {
            setModel(loadedModel)
            console.log("model loaded")
        })
        .catch((error: Error) => {
            console.error('Error loading model:', error)
        })
    }, [])


    useEffect(() => {
        loadModel()
    }, [])


    return (
        <SudokuApplicationContext.Provider value={application}>
            <main className={styles.main}>
                <div className={styles.camera}>
                    <div className={styles.cameraFeedContainer}>
                        <CameraFeed videoRef={videoRef} width={300} height={300} cameraState={cameraState} setCameraState={setCameraState} callbackFunction={callbackFunction}/>
                        <canvas className={styles.overlay} width={300} height={300} ref={transformedSolutionCanvasRef}></canvas>
                    </div>
                    <CameraButton/>
                </div>
                <canvas width={300} height={300} ref={canvasRef}></canvas>
                <canvas width={300} height={300} ref={transformedCanvasRef}></canvas>
            </main>
            <canvas width={300} height={300} ref={solutionCanvasRef}></canvas>

        </SudokuApplicationContext.Provider>
    )
}
