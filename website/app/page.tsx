"use client"
import styles from "./page.module.scss" 
import {useRef} from "react"
import CameraFeed from "./components/Camera/CameraFeed"
import CameraButton from "./components/Camera/CameraButton"
import CameraSnap from "./components/Camera/CameraSnap"

import { drawVideoOnCanvas, getCorners } from "./imageUtil"

export default function Home() {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const photoRef = useRef<HTMLCanvasElement | null>(null)

    return (
        <main className={styles.main}>
            <CameraFeed videoRef={videoRef} callbackFunction={drawVideoOnCanvas.bind(null, videoRef, photoRef)}/>
            <CameraButton videoRef={videoRef} photoRef={photoRef} />
            <CameraSnap photoRef={photoRef}/>
            <button onClick={() => getCorners(photoRef)}>test</button>
        </main>
    )
}
