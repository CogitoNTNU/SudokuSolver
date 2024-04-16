"use client"
import styles from "./page.module.scss"
import { useRef, useState, useEffect, useCallback } from "react"
import CameraFeed from "./components/Camera/CameraFeed"
import CameraButton from "./components/Camera/CameraButton"
import { SudokuApplicationContext } from "./context/sudokuApplication/SudokuApplication"
import { SudokuState, SUDOKU_SIZE } from "./context/sudokuApplication/types"
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
    const [windowSize, setWindowSize] = useState({width: 0, height: 0})
    
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
        if (!videoRef.current || !canvasRef.current || !transformedCanvasRef.current || !solutionCanvasRef.current || !transformedSolutionCanvasRef.current) {
            throw new Error("Ref is not used correctly")
        }
        drawVideoOnCanvas(videoRef.current, canvasRef.current, application, transformedCanvasRef.current, solutionCanvasRef.current, transformedSolutionCanvasRef.current)
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
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight
        })
    }, [])


    useEffect(() => {
        if (!transformedSolutionCanvasRef.current || !videoRef.current || !canvasRef.current) {
            throw new Error("Ref is not used correctly")
        }
        transformedSolutionCanvasRef.current.width = videoRef.current.videoWidth
        transformedSolutionCanvasRef.current.height = videoRef.current.videoHeight
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        console.log("state changed")
    }, [cameraState])


    return (
        <SudokuApplicationContext.Provider value={application}>
            <div className={styles.sudokuApplication}>
                <div className={styles.cameraWrapper}>
                    <div className={styles.camera}>
                        <CameraFeed videoRef={videoRef} cameraState={cameraState} setCameraState={setCameraState} callbackFunction={callbackFunction}/>
                        {/* <canvas className={styles.overlay} ref={transformedSolutionCanvasRef}></canvas> */}
                        <canvas className={`${styles.overlay} ${cameraState == CameraState.Off ? styles.hidden : ""}`} ref={transformedSolutionCanvasRef}></canvas>
                        <CameraButton/>
                    </div>
                </div>
                <canvas ref={canvasRef}></canvas>
                <canvas width={450} height={450} ref={transformedCanvasRef}></canvas>
            </div>
            <canvas width={300} height={300} ref={solutionCanvasRef}></canvas>

        </SudokuApplicationContext.Provider>
    )
}
