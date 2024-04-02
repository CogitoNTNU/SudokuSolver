"use client"
import styles from "./CameraFeed.module.scss"
import { useEffect, useState, useRef, useCallback, forwardRef, useImperativeHandle } from "react"
import { CameraFeedProps, CameraFeedRef } from "./CameraFeedTypes"


const CameraFeed = forwardRef<CameraFeedRef, CameraFeedProps>((props: CameraFeedProps, ref) => {
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
    }, [])


    const start = useCallback( async () => {
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
            video.play()
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


    useImperativeHandle(ref, () => {
        return {
            start,
            stop
        }
    })


    useEffect(() => {
        return stop
    }, [])

    
    return (
        <div className={styles.wrapper}>
            <video className={styles.cameraFeed} ref={props.videoRef}></video>
        </div>
    )
})

export default CameraFeed