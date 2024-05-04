"use client"
import styles from "./SudokuApplicationElement.module.scss"
import CameraFeed from "../Camera/CameraFeed"
import CameraButton from "../Camera/CameraButton"
import { useRef, useEffect, useCallback, useState } from "react"
import { videoCallback } from "../../util/image" 
import { useSudokuApplicationContext } from "../../context/sudokuApplication/SudokuApplication"
import { loadLayersModel } from "@tensorflow/tfjs"
import { SudokuState } from "@/app/context/sudokuApplication/Types"
import { CameraState } from "../Camera/Types"


export default function SudokuApplicationElement() {
    const application = useSudokuApplicationContext()

    const cameraRef = useRef<HTMLDivElement | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const solutionCanvasRef = useRef<HTMLCanvasElement | null>(null)

    const [constraints, setConstraints] = useState<MediaStreamConstraints>({
        video: {
            facingMode: { ideal: "environment" }
        }
    })


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
        if (!cameraRef.current) {
            throw new Error("cameraRef not used correctly")
        }
        const width = cameraRef.current.clientWidth
        const height = cameraRef.current.clientHeight

        // Cursed code because safari on ios request camera as if the phone is in landscape
        const isPortrait = height > width
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

        if (isMobile && isPortrait && isSafari) {
            setConstraints({
                video: {
                    facingMode: { ideal: "environment" },
                    width: height,
                    height: width
                } 
            })
        }
        else {
            setConstraints({
                video: {
                    facingMode: { ideal: "environment" },
                    width,
                    height
                } 
            })
        }
    }, [])


    useEffect(() => {
        if (!overlayCanvasRef.current || !videoRef.current) {
            throw new Error("Ref is not used correctly")
        }
        overlayCanvasRef.current.width = videoRef.current.width
        overlayCanvasRef.current.height = videoRef.current.height
    }, [application.cameraState])


    return (
        <div ref={cameraRef} className={styles.camera}>
            <CameraFeed width={cameraRef.current?.clientWidth} height={cameraRef.current?.clientHeight} videoRef={videoRef} cameraState={application.cameraState} setCameraState={application.setCameraState} constraints={constraints} callbackFunction={callbackFunction}/>
            <canvas className={`${styles.overlay} ${(application.sudokuState == SudokuState.Solved && application.cameraState == CameraState.On) ? "" : styles.hidden}`} ref={overlayCanvasRef}></canvas>
            <div className={styles.SolutionAndButtonWrapper}>
                <div className={styles.solutionCanvasWrapper}>
                    <canvas className={`${(application.sudokuState != SudokuState.NotFound && application.cameraState == CameraState.Off ? "" : styles.hidden)}`} ref={solutionCanvasRef}></canvas>
                </div>
                <div className={styles.buttonWrapper}>
                    <CameraButton/>
                </div>
            </div>
        </div>
    )
}