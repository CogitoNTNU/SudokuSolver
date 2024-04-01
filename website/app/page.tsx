"use client"
import styles from "./page.module.scss" 
import {useRef} from "react"
import CameraFeed from "./components/Camera/CameraFeed"
import CameraSnap from "./components/Camera/CameraSnap"

import { drawVideoOnCanvas } from "./imageUtil"

export default function Home() {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const transformedCanvasRef = useRef<HTMLCanvasElement | null>(null)

    return (
        <main className={styles.main}>
            <CameraFeed videoRef={videoRef} callbackFunction={drawVideoOnCanvas.bind(null, videoRef, canvasRef, transformedCanvasRef)}/>
            <CameraSnap canvasRef={canvasRef}/>
            <canvas className={styles.invert} width={300} height={300} ref={transformedCanvasRef}></canvas>
        </main>
    )
}
