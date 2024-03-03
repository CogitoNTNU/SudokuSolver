
import styles from "./CameraButton.module.scss"

interface CameraButtonProps {
    videoRef: React.RefObject<HTMLVideoElement> 
    photoRef: React.RefObject<HTMLCanvasElement>
}

export default function CameraButton(props: CameraButtonProps) {

    function takePhoto() {
        const width = 600
        const height = 600

        let video = props.videoRef.current
        let photo = props.photoRef.current

        if (!video) {
            console.log("video not defined")
            return
        }
        if (!photo) {
            console.log("photo not defined")
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
    }

    return (
        <div>
            <button className={styles.snapButton} onClick={takePhoto}>Take photo</button>
        </div>
    )
}