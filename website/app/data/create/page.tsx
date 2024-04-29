"use client"
import styles from "./styles.module.scss"
import { useCallback, useRef, useState } from "react"
import CameraFeed from "@/app/components/Camera/CameraFeed"
import { CameraState } from "@/app/components/Camera/Types"
import cv from "@techstark/opencv-js"
import { getCorners, sudokuImgToBatchImagesArray, transformImgSection } from "@/app/util/image"
import { sortPointsRadially } from "@/app/util/sort"
import { NUMBER_IMAGE_HEIGHT, NUMBER_IMAGE_WIDTH, SUDOKU_WIDTH, SUDOKU_HEIGHT, NUMBER_IMAGE_SIZE, SUDOKU_SIZE } from "@/app/context/sudokuApplication/Types"
import Link from "next/link"

export default function Page() {
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    const [cameraState, setCameraState] = useState<CameraState>(CameraState.Off)

    const constraints: MediaStreamConstraints = {
        video: {
            facingMode: { ideal: "environment" },
            // width: 400,
            // height: 400
        }
    }

    const callbackFunction = useCallback(() => {
        const canvas = canvasRef.current
        const video = videoRef.current
        if (canvas && video) {
            canvas.width = 600
            canvas.height = 600
            const ctx = canvas.getContext("2d")
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
                const img = cv.imread(canvas)
                const corners = getCorners(img)

                if (corners) {
                    sortPointsRadially(corners)
                    transformImgSection(img, img, corners.flat(), [0, 0, canvas.width, 0, canvas.width, canvas.height, 0, canvas.height], new cv.Size(canvas.width, canvas.height))
                    cv.imshow(canvas, img)

                    const [batchImagesArray, indices] = sudokuImgToBatchImagesArray(img)
                    
                    const imgData = new ImageData(NUMBER_IMAGE_WIDTH * SUDOKU_WIDTH, NUMBER_IMAGE_HEIGHT * SUDOKU_HEIGHT)
                    let index = 0
                    for (let w = 0; w < 9; w++) {
                        for (let y = 0; y < 28; y++) {
                            for (let x = 0; x < 9; x ++) {
                                for (let z = 0; z < 28; z++) {
                                    const i =  batchImagesArray[w*7056 + x*28*28 + z + y*28]
                                    const j = Math.floor(i * 255)
                                    imgData.data[index] = j
                                    imgData.data[index+1] = j
                                    imgData.data[index+2] = j
                                    imgData.data[index+3] = 255
                                    index += 4
                                } 
                            }
                        }
                    }
                    canvas.width = SUDOKU_WIDTH*NUMBER_IMAGE_WIDTH
                    canvas.height = SUDOKU_HEIGHT*NUMBER_IMAGE_HEIGHT
                    imgData.data[imgData.data.length-1] = indices.length
                    ctx.putImageData(imgData, 0, 0)
                }

                img.delete()

            }
        }
    }, [])

    return (
        <div>
            <Link href={"/data"}>
                <button>Se på data</button>
            </Link>
            <CameraFeed videoRef={videoRef} cameraState={cameraState} setCameraState={setCameraState} constraints={constraints} callbackFunction={callbackFunction}/>
            {
                cameraState == CameraState.Off 
                ? 
                    <button className={styles.cameraButton} onClick={() => {setCameraState(CameraState.Pending)}}>Start</button>
                :
                    <button className={styles.cameraButton} onClick={() => {setCameraState(CameraState.Off)}}>Stop</button>
            }
            <canvas ref={canvasRef}></canvas>
            <button onClick={() => {
                const canvas = canvasRef.current
                if (canvas) {
                    const ctx = canvas.getContext("2d")
                    if (ctx) {
                        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                        const l = imgData.data[imgData.data.length-1]
                        console.log(l)
                        for (let i = 0; i < l; i++) {
                            const x = i%SUDOKU_WIDTH
                            const y = Math.floor(i/SUDOKU_WIDTH)
                            const pixeldata = ctx.getImageData(x*NUMBER_IMAGE_WIDTH, y*NUMBER_IMAGE_HEIGHT, NUMBER_IMAGE_WIDTH, NUMBER_IMAGE_HEIGHT).data
                            const data = new Uint8Array(NUMBER_IMAGE_SIZE)
                            for (let j = 0; j < NUMBER_IMAGE_SIZE; j++) {
                                data[j] = pixeldata[j*4]
                            }
                            console.log(pixeldata)
                            console.log(data)
                            console.log(Buffer.from(data));

                            (async ()=> {
                                const response = await fetch("../api/image/create", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/octet-stream"
                                    },
                                    body: Buffer.from(data)
                                })
                                console.log(response)
                            })()

                        }

                    }
                }
            }}>Upload</button>
        </div>
    )
}