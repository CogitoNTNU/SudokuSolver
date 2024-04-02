export interface CameraFeedProps {
    videoRef: React.RefObject<HTMLVideoElement>,
    callbackFunction?: () => void
}


export interface CameraFeedRef {
    start: () => void,
    stop: () => void
}
