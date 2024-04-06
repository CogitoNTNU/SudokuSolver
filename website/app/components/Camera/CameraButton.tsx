import styles from "./CameraButton.module.scss"
import { useSudokuApplicationContext } from "@/app/context/sudokuApplication/SudokuApplication"
import { CameraState } from "./Types"


export default function CameraButton() {
    const application = useSudokuApplicationContext()

    return (
        <>
        {
            application.cameraState == CameraState.Off
            ?
                <div className={`${styles.button} ${styles.inactive}`} onClick={() => {
                    application.setCameraState(CameraState.Pending)
                }}
                >Start Camera</div>
            :
                <div className={`${styles.button} ${styles.active}`} onClick={() => {
                    if (application.cameraState == CameraState.On) {
                        application.setCameraState(CameraState.Off)
                    }
                }}
                >Stop Camera</div>
        }
        </>
    )
}