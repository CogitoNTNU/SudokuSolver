"use client"
import styles from "./SudokuApplication.module.scss"
import CameraFeed from "../Camera/CameraFeed"
import CameraButton from "../Camera/CameraButton"
import { useRef, useEffect, useCallback } from "react"
import { videoCallback } from "../../util/image" 
import { useSudokuApplicationContext } from "../../context/sudokuApplication/SudokuApplication"
import { loadLayersModel } from "@tensorflow/tfjs"
import { SudokuState } from "@/app/context/sudokuApplication/Types"
import { CameraState } from "../Camera/Types"


export default function SudokuApplicationElement() {
    const application = useSudokuApplicationContext()

    const videoRef = useRef<HTMLVideoElement | null>(null)
    const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const solutionCanvasRef = useRef<HTMLCanvasElement | null>(null)

    const constraints: MediaStreamConstraints = {
        video: {
            facingMode: { ideal: "environment" },
            // width: 400,
            // height: 400
        }
    }


    const callbackFunction = useCallback(() => {
        if (application.model) {
            if (!videoRef.current || !overlayCanvasRef.current || !solutionCanvasRef.current) {
                throw new Error("Ref is not used correctly")
            }
            videoCallback(videoRef.current, application, overlayCanvasRef.current, solutionCanvasRef.current)
        }
    }, [application.cameraState, application.sudokuState, application.model, application.sudoku, application.solution])


    useEffect(() => {
        loadLayersModel('/models/digit_model/model.json').then(loadedModel => {
            application.setModel(loadedModel)
            console.log("model loaded", loadedModel)
        })
        .catch((error: Error) => {
            console.error('Error loading model:', error)
        })
    }, [])


    useEffect(() => {
        if (!overlayCanvasRef.current || !videoRef.current) {
            throw new Error("Ref is not used correctly")
        }
        overlayCanvasRef.current.width = videoRef.current.width
        overlayCanvasRef.current.height = videoRef.current.height
    }, [application.cameraState])


    return (
        <>
            <div className={styles.sudokuApplication}>
                <div className={styles.cameraWrapper}>
                    <div className={styles.camera}>
                        <CameraFeed videoRef={videoRef} cameraState={application.cameraState} setCameraState={application.setCameraState} constraints={constraints} callbackFunction={callbackFunction}/>
                        <canvas className={`${styles.overlay} ${(application.sudokuState == SudokuState.Solved && application.cameraState == CameraState.On) ? "" : styles.hidden}`} ref={overlayCanvasRef}></canvas>
                        <canvas className={(application.sudokuState != SudokuState.NotFound && application.cameraState == CameraState.Off ? "" : styles.hidden)} ref={solutionCanvasRef}></canvas>
                    </div>
                    <div className={styles.buttonWrapper}>
                        <CameraButton/>
                    </div>
                </div>
            </div>
        </>
    )
}