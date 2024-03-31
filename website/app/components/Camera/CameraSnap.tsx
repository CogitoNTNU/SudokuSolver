import { useEffect } from "react"
import styles from "./CameraSnap.module.scss"

interface CameraSnapProps {
    canvasRef: React.RefObject<HTMLCanvasElement>
}

export default function CameraSnap(props: CameraSnapProps) {
    useEffect(() => {
        if (props.canvasRef.current) {
            props.canvasRef.current.width = 300
            props.canvasRef.current.height = 300
        }
    }, [props.canvasRef])

    return (
        <div>
            <canvas className={styles.snap} ref={props.canvasRef}></canvas>
        </div>
    )
}