import styles from "./CameraSnap.module.scss"

interface CameraSnapProps {
    photoRef: React.RefObject<HTMLCanvasElement>
}

export default function CameraSnap(props: CameraSnapProps) {
    return (
        <div>
            <canvas className={styles.snap} ref={props.photoRef}></canvas>
        </div>
    )
}