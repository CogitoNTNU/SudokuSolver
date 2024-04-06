"use client"
import styles from "./CameraFeed.module.scss"
import { useEffect, useRef, useCallback } from "react"
import { CameraFeedProps, CameraState } from "./Types"


export default function CameraFeed(props: CameraFeedProps) {
    const streamRef = useRef<MediaStream | null>(null)
    const animationFrameRef = useRef<number | null>(null)


    const handleVideoPlay = useCallback(() => {
        const callbackWrapper = () => {
            if (props.callbackFunction) {
                props.callbackFunction()
                animationFrameRef.current = requestAnimationFrame(callbackWrapper)
            }
        }
        callbackWrapper()
        props.setCameraState(CameraState.On)
        console.log("Should be started")
    }, [])


    const start = useCallback(async () => {
        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({
                video: { width: 300, height: 300 }
            })
            const video = props.videoRef.current
            if (!video) {
                console.error("video is undefined")
                return
            }
            video.srcObject = streamRef.current
            video.play().catch(error => {
                console.log(error)
            })
            props.setCameraState(CameraState.On)
            video.addEventListener("play", handleVideoPlay)
        }
        catch (error)  {
            console.error(error)
        }
    }, [])


    const stop = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop()
            })
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
            animationFrameRef.current = null
        }
        if (props.videoRef.current) {
            props.videoRef.current.removeEventListener("play", handleVideoPlay)
        }

    }, [])


    useEffect(() => {
        console.log(props.cameraState)
        switch (props.cameraState) {
            case CameraState.Pending:
                start()
                break
            case CameraState.Off:
                stop()
                break
            case CameraState.On:
                return stop
        }
    }, [props.cameraState])


    return (
        <video className={styles.cameraFeed} ref={props.videoRef}></video>
    )
}
