"use client"
import { useEffect } from "react"

import styles from "./CameraFeed.module.scss"

interface CameraFeedProps {
    videoRef: React.RefObject<HTMLVideoElement>
}

export default function CameraFeed(props: CameraFeedProps) {

    function getVideo() {
        navigator.mediaDevices.getUserMedia({
            video: { width: 600, height: 600 }
        })
        .then(stream => {
            let video = props.videoRef.current
            if (!video) {
                console.log("video not defined")
                return
            }
            video.srcObject = stream
            video.play()
        })
        .catch(error => {
            console.error(error)
        })
    }
    

    useEffect(() => {
        getVideo()
    }, [props.videoRef])

    return (
        <div>
            <video className={styles.cameraFeed} ref={props.videoRef}></video>
        </div>
    )
}