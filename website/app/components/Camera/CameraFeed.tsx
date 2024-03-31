"use client"
import styles from "./CameraFeed.module.scss"
import { useEffect, useState, useRef, useCallback } from "react"


interface CameraFeedProps {
    videoRef: React.RefObject<HTMLVideoElement>,
    callbackFunction?: () => void
}

export default function CameraFeed(props: CameraFeedProps) {
    const streamRef = useRef<MediaStream | null>(null)
    const animationFrameRef = useRef<number | null>(null)

    const [cameraActive, setCameraActive] = useState(false)

    const handleVideoPlay = useCallback(() => {
        const callbackWrapper = () => {
            if (props.callbackFunction) {
                props.callbackFunction()
                animationFrameRef.current = requestAnimationFrame(callbackWrapper)
            }
        }
        callbackWrapper()
    }, [])


    async function getVideo() {
        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({
                video: { width: 600, height: 600 }
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
    }


    function cleanUp() {
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

    }
    

    useEffect(() => {
        return cleanUp
    }, [])

    return (
        <div>
            <video className={styles.cameraFeed} ref={props.videoRef}></video>
            {
                cameraActive
                ?
                    <button onClick={() => {
                        setCameraActive(false)
                        cleanUp()
                    }}
                    >Stop Camera</button>
                :
                    <button onClick={() => {
                        setCameraActive(true)
                        getVideo()
                    }}
                    >Start Camera</button>
            }
        </div>
    )
}