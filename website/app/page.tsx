"use client"
import styles from "./page.module.scss" 
import {useRef} from "react"
import CameraFeed from "./components/Camera/CameraFeed"
import CameraButton from "./components/Camera/CameraButton"
import CameraSnap from "./components/Camera/CameraSnap"

import { drawVideoOnCanvas } from "./imageUtil"

export default function Home() {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const transformedRef = useRef<HTMLCanvasElement | null>(null)

    return (
        <main className={styles.main}>
            <CameraFeed videoRef={videoRef} callbackFunction={drawVideoOnCanvas.bind(null, videoRef, canvasRef, transformedRef)}/>
            {/* <CameraButton videoRef={videoRef} photoRef={photoRef} /> */}
            <CameraSnap canvasRef={canvasRef}/>
            <canvas width={300} height={300} ref={transformedRef}></canvas>
        </main>
    )
}
