"use client"
import {useRef, useEffect, useState} from "react"

import styles from "./Camera.module.scss"


export default function Camera() {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const photoRef = useRef<HTMLCanvasElement | null>(null)

    const [hasPhoto, setHasPhoto] = useState(false)

    function getVideo() {
        navigator.mediaDevices.getUserMedia({
            video: { width: 600, height: 600 }
        })
        .then(stream => {
            let video = videoRef.current
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

    function takePhoto() {
        const width = 600
        const height = 600

        let video = videoRef.current
        let photo = photoRef.current

        if (!(video && photo)) {
            console.log("video or photo not defined")
            return
        }
        photo.width = width
        photo.height = height

        let ctx = photo.getContext("2d")
        if (!ctx) {
            console.log("Could not get ctx")
            return
        }
        ctx.drawImage(video, 0, 0, width, height)
        setHasPhoto(true)
    }

    useEffect(() => {
        getVideo()
    }, [videoRef])

    return (
        <>
            <div className="camera">
                <video ref={videoRef}></video>
                <button onClick={takePhoto}>Snap</button>
            </div>
            <div className={"result" + (hasPhoto ? "hasPhoto" : "")}>
                <canvas ref={photoRef}></canvas>
            </div>
        </>
    )
}