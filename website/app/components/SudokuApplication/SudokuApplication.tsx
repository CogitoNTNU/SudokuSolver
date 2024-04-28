"use client"
import styles from "./SudokuApplication.module.scss"
import CameraFeed from "../Camera/CameraFeed"
import CameraButton from "../Camera/CameraButton"
import { useRef, useEffect, useCallback } from "react"
import { videoCallback } from "../../util/image" 
import { useSudokuApplicationContext } from "../../context/sudokuApplication/SudokuApplication"
import { loadLayersModel } from "@tensorflow/tfjs"
import { SudokuApplication, SudokuState } from "@/app/context/sudokuApplication/Types"


export default function SudokuApplicationElement() {
    const application = useSudokuApplicationContext()

    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const constraints: MediaStreamConstraints = {
        video: {
            facingMode: { ideal: "environment" }
        }
    }


    const callbackFunction = useCallback(() => {
        if (application.model) {
            // console.log(application.sudokuState, application.sudoku)
            if (!videoRef.current || !canvasRef.current) {
                throw new Error("Ref is not used correctly")
            }
            videoCallback(videoRef.current, application, canvasRef.current)
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


    // useEffect(() => {
    //     console.log("state changed to ", application.sudokuState, application.sudoku)
    // }, [application.sudokuState])


    useEffect(() => {
        if (!canvasRef.current || !videoRef.current) {
            throw new Error("Ref is not used correctly")
        }
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
    }, [application.cameraState])


    return (
        <>
            <div className={styles.sudokuApplication}>
                <div className={styles.cameraWrapper}>
                    <div className={styles.camera}>
                        <CameraFeed videoRef={videoRef} cameraState={application.cameraState} setCameraState={application.setCameraState} constraints={constraints} callbackFunction={callbackFunction}/>
                        <canvas className={`${styles.overlay} ${application.sudokuState == SudokuState.Solved ? "" : styles.hidden}`} ref={canvasRef}></canvas>
                        <CameraButton/>
                    </div>
                </div>
            </div>
        </>
    )
}