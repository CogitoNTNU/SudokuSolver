import { Dispatch, SetStateAction } from "react"

export interface CameraFeedProps {
    videoRef: React.RefObject<HTMLVideoElement>,
    width: number,
    height: number,
    cameraState: CameraState
    setCameraState: Dispatch<SetStateAction<CameraState>>
    callbackFunction?: Function
}

export enum CameraState {
    Off,
    Pending,
    On
}