import styles from "./CameraButton.module.scss"
import { useSudokuApplicationContext } from "@/app/context/sudokuApplication/SudokuApplication"
import { SudokuState } from "@/app/context/sudokuApplication/Types"
import { CameraState } from "./Types"


export default function CameraButton() {
    const application = useSudokuApplicationContext()

    return (
        <div className={styles.circle}>
            {
                application.cameraState == CameraState.Off
                ?
                    <div className={styles.inactive} onClick={() => {
                        application.setSudokuState(SudokuState.NotFound)
                        application.setCameraState(CameraState.Pending)
                    }}
                    ></div>
                    :
                    <div className={styles.active} onClick={() => {
                        if (application.cameraState == CameraState.On) {
                            application.setCameraState(CameraState.Off)
                        }
                    }}
                    ></div>
            }
        </div>
    )
}
