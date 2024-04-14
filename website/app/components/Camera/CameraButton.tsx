import styles from "./CameraButton.module.scss"
import { useSudokuApplicationContext } from "@/app/context/sudokuApplication/SudokuApplication"
import { SudokuState, SUDOKU_SIZE } from "@/app/context/sudokuApplication/Types"
import { CameraState } from "./Types"


export default function CameraButton() {
    const application = useSudokuApplicationContext()

    return (
        <div className={styles.circle}>
            {
                application.cameraState == CameraState.Off
                ?
                    <div className={styles.inactive} onClick={() => {
                        // Reset application variables when starting camera
                        for (let i = 0; i < SUDOKU_SIZE; i++) {
                            application.sudoku[i] = 0
                            application.probability[i] = 0
                            application.solution[i] = 0
                        }
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