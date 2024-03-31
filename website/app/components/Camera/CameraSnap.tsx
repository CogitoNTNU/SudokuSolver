import { useEffect } from "react"
import styles from "./CameraSnap.module.scss"

interface CameraSnapProps {
    photoRef: React.RefObject<HTMLCanvasElement>
}

export default function CameraSnap(props: CameraSnapProps) {
    useEffect(() => {
        if (props.photoRef.current) {
            props.photoRef.current.width = 600
            props.photoRef.current.height = 600
        }
    }, [props.photoRef])

    return (
        <div>
            <canvas className={styles.snap} ref={props.photoRef}></canvas>
        </div>
    )
}