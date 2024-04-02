import styles from "./CameraButton.module.scss"
import { useState, RefObject } from "react"
import { CameraFeedRef } from "./CameraFeedTypes"

interface CameraButtonProps {
    cameraFeedRef: RefObject<CameraFeedRef>
}

export default function CameraButton(props: CameraButtonProps) {
    const [cameraActive, setCameraActive] = useState(false)

    return (
        <>
        {
            cameraActive
            ?
            <button onClick={() => {
                setCameraActive(false)
                props.cameraFeedRef.current?.stop()
            }}
            >Stop Camera</button>
            :
            <button onClick={() => {
                setCameraActive(true)
                props.cameraFeedRef.current?.start()
            }}
            >Start Camera</button>
        }
        </>
    )
}