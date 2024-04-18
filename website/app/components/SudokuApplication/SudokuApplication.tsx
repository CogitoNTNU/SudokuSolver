"use client"
import styles from "./SudokuApplication.module.scss"
import CameraFeed from "../Camera/CameraFeed"
import CameraButton from "../Camera/CameraButton"
import { useRef, useEffect, useCallback } from "react"
import { CameraState } from "../Camera/Types" 
import { drawVideoOnCanvas } from "../../util/image"
import { useSudokuApplicationContext } from "../../context/sudokuApplication/SudokuApplication"
import { loadLayersModel } from "@tensorflow/tfjs"


export default function SudokuApplicationElement() {
    const application = useSudokuApplicationContext()

    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const transformedCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const solutionCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const transformedSolutionCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const batchCanvasRef = useRef<HTMLCanvasElement | null>(null)

    const callbackFunction = useCallback(() => {
        if (application.model) {
            if (!videoRef.current || !canvasRef.current || !transformedCanvasRef.current || !solutionCanvasRef.current || !transformedSolutionCanvasRef.current || !batchCanvasRef.current) {
                throw new Error("Ref is not used correctly")
            }
            drawVideoOnCanvas(videoRef.current, canvasRef.current, application, transformedCanvasRef.current, solutionCanvasRef.current, transformedSolutionCanvasRef.current, batchCanvasRef.current)
        }
    }, [])
    

    const loadModel = useCallback(() => {
        loadLayersModel('/models/tfjs_model/model.json').then(loadedModel => {
            application.model = loadedModel
            console.log("model loaded")
        })
        .catch((error: Error) => {
            console.error('Error loading model:', error)
        })
    }, [])


    useEffect(() => {
        loadModel()
    }, [])


    useEffect(() => {
        if (!transformedSolutionCanvasRef.current || !videoRef.current || !canvasRef.current) {
            throw new Error("Ref is not used correctly")
        }
        transformedSolutionCanvasRef.current.width = videoRef.current.videoWidth
        transformedSolutionCanvasRef.current.height = videoRef.current.videoHeight
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
    }, [application.cameraState])

    
    const logSudoku = useCallback(() => {
        console.log(application.sudoku)
    }, [])

    return (
        <>
            <div className={styles.sudokuApplication}>
                <div className={styles.cameraWrapper}>
                    <div className={styles.camera}>
                        <CameraFeed videoRef={videoRef} cameraState={application.cameraState} setCameraState={application.setCameraState} callbackFunction={callbackFunction}/>
                        <canvas className={`${styles.overlay} ${application.cameraState == CameraState.Off ? styles.hidden : ""}`} ref={transformedSolutionCanvasRef}></canvas>
                        <CameraButton/>
                    </div>
                </div>
                <canvas ref={canvasRef}></canvas>
                <canvas width={450} height={450} ref={transformedCanvasRef}></canvas>
            </div>
            <canvas width={300} height={300} ref={solutionCanvasRef}></canvas>
            <canvas ref={batchCanvasRef}></canvas>
            <button onClick={logSudoku}>Log sudoku</button>
        </>
    )
}