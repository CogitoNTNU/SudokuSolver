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
            <button onClick={() => {
                application.setCameraState(CameraState.Pending)
                console.log("Start")
            }}
            >Start Camera</button>
            :
            <button onClick={() => {
                if (application.cameraState == CameraState.On) {
                    application.setCameraState(CameraState.Off)
                }
                console.log("Stop")
            }}
            >Stop Camera</button>
        }
        </>
    )
}