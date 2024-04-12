import styles from "./CameraButton.module.scss"
import { useState, useEffect } from "react"
import { useSudokuApplicationContext } from "@/app/context/sudokuApplication/SudokuApplication"
import { CameraState } from "./Types"


export default function CameraButton() {
    const application = useSudokuApplicationContext()

    return (
        <div>

            <div className={`${styles.circle}`}></div>
            {
                application.cameraState == CameraState.Off
                ?
                    <div className={`${styles.button} ${styles.inactive}`} onClick={() => {
                        application.setCameraState(CameraState.Pending)
                    }}
                    ></div>
                :
                    <div className={`${styles.button} ${styles.active}`} onClick={() => {
                        if (application.cameraState == CameraState.On) {
                            application.setCameraState(CameraState.Off)
                        }
                    }}
                    ></div>
            }
        </div>
    )
}