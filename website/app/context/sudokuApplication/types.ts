import { Dispatch, SetStateAction } from "react"
import { CameraState } from "@/app/components/Camera/Types"

export interface SudokuApplication {
    cameraState: CameraState,
    setCameraState: Dispatch<SetStateAction<CameraState>>
}