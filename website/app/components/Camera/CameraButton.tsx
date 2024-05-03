import styles from "./CameraButton.module.scss"
import { useSudokuApplicationContext } from "@/app/context/sudokuApplication/SudokuApplication"
import { SudokuState } from "@/app/context/sudokuApplication/Types"
import { CameraState } from "./Types"


export default function CameraButton() {
    const application = useSudokuApplicationContext()

    return (
        application.cameraState == CameraState.Off
        ? 
            <div className={styles.circle} onClick={() => {
                application.setSudokuState(SudokuState.NotFound)
                application.setCameraState(CameraState.Pending)
            }}>
                <div className={styles.inactive}></div>
            </div>
        : 
            <div className={styles.circle} onClick={() => {
                if (application.cameraState == CameraState.On) {
                    application.setCameraState(CameraState.Off)
                }
            }}>
                <div className={styles.active}></div>
            </div>
    )
}
