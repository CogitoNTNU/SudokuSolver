"use client"
import styles from "./page.module.scss" 
import {useRef} from "react"
import CameraFeed from "./components/Camera/CameraFeed"
import { CameraFeedRef } from "./components/Camera/CameraFeedTypes"
import CameraSnap from "./components/Camera/CameraSnap"
import CameraButton from "./components/Camera/CameraButton"

import { drawVideoOnCanvas } from "./imageUtil"

export default function Home() {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const transformedCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const solutionCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const transformedSolutionCanvasRef = useRef<HTMLCanvasElement | null>(null)

    const cameraFeedRef = useRef<CameraFeedRef | null>(null)

    return (
        <>
        <main className={styles.main}>
            <div className={styles.camera}>
                <div className={styles.cameraFeedContainer}>
                    <CameraFeed ref={cameraFeedRef} videoRef={videoRef} callbackFunction={drawVideoOnCanvas.bind(null, videoRef, canvasRef, transformedCanvasRef, solutionCanvasRef, transformedSolutionCanvasRef)}/>
                    <canvas className={styles.overlay} width={300} height={300} ref={transformedSolutionCanvasRef}></canvas>
                </div>
                <CameraButton cameraFeedRef={cameraFeedRef}/>
            </div>
            <CameraSnap canvasRef={canvasRef}/>
            <canvas className={styles.invert} width={300} height={300} ref={transformedCanvasRef}></canvas>
        </main>
        <canvas width={300} height={300} ref={solutionCanvasRef}></canvas>
        </>
    )
}
