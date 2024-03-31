"use client"
import { useEffect } from "react"

import styles from "./CameraFeed.module.scss"

interface CameraFeedProps {
    videoRef: React.RefObject<HTMLVideoElement>,
    callbackFunction?: () => void
}

export default function CameraFeed(props: CameraFeedProps) {
    let stream: MediaStream | null = null
    let animationFrame: number | null = null

    async function getVideo() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 600, height: 600 }
            })
            const video = props.videoRef.current
            if (!video) {
                console.log("video not defined")
                return
            }
            video.srcObject = stream
            video.play()

            video.addEventListener("play", () => {
                const callbackWrapper = () => {
                    if (props.callbackFunction) {
                        props.callbackFunction()
                        requestAnimationFrame(callbackWrapper)
                    }
                }
                callbackWrapper()
            })

        }
        catch (error)  {
            console.error(error)
        }
    }
    

    useEffect(() => {
        getVideo()
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => {
                    track.stop()
                })
            }
            if (animationFrame) {
                cancelAnimationFrame(animationFrame)
            }
        }
    }, [props.videoRef])

    return (
        <div>
            <video className={styles.cameraFeed} ref={props.videoRef}></video>
        </div>
    )
}