"use client"
import styles from "./page.module.scss" 
import { useRef, useState } from "react"
import CameraFeed from "./components/Camera/CameraFeed"
import CameraButton from "./components/Camera/CameraButton"
import { SudokuApplicationContext } from "./context/sudokuApplication/SudokuApplication"
import { CameraState } from "./components/Camera/Types" 
import { drawVideoOnCanvas } from "./util/image"

export default function Home() {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const transformedCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const solutionCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const transformedSolutionCanvasRef = useRef<HTMLCanvasElement | null>(null)

    const [cameraState, setCameraState] = useState<CameraState>(CameraState.Off)

    const application = {
        cameraState,
        setCameraState
    }

    return (
        <SudokuApplicationContext.Provider value={application}>
            <main className={styles.main}>
                <div className={styles.camera}>
                    <div className={styles.cameraFeedContainer}>
                        <CameraFeed videoRef={videoRef} cameraState={cameraState} setCameraState={setCameraState} callbackFunction={drawVideoOnCanvas.bind(null, videoRef, canvasRef, transformedCanvasRef, solutionCanvasRef, transformedSolutionCanvasRef)}/>
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
