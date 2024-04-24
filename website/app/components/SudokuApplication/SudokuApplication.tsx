"use client"
import styles from "./SudokuApplication.module.scss"
import CameraFeed from "../Camera/CameraFeed"
import CameraButton from "../Camera/CameraButton"
import { useRef, useEffect, useCallback } from "react"
import cv from "@techstark/opencv-js"
import { CameraState } from "../Camera/Types" 
import { drawVideoOnCanvas, predictionToSudoku } from "../../util/image" 
import { useSudokuApplicationContext } from "../../context/sudokuApplication/SudokuApplication"
import { loadLayersModel } from "@tensorflow/tfjs"
import { sudokuImgToBatchImagesArray } from "../../util/image"
import { predictBatchImages } from "@/app/util/model"
import { NUMBER_IMAGE_WIDTH, NUMBER_IMAGE_HEIGHT, SUDOKU_WIDTH, SUDOKU_HEIGHT, SUDOKU_SIZE, NUM_CLASSES } from "@/app/context/sudokuApplication/Types"
import { solve } from "@/app/util/solver"


export default function SudokuApplicationElement() {
    const application = useSudokuApplicationContext()

    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const transformedCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const solutionCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const transformedSolutionCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const batchCanvasRef = useRef<HTMLCanvasElement | null>(null)

    const solveWorkerRef = useRef<Worker>(new Worker(new URL("solveWorker.ts", import.meta.url)))

    const callbackFunction = useCallback(() => {
        if (application.model) {
            if (!videoRef.current || !canvasRef.current || !transformedCanvasRef.current || !solutionCanvasRef.current || !transformedSolutionCanvasRef.current || !batchCanvasRef.current) {
                throw new Error("Ref is not used correctly")
            }
            drawVideoOnCanvas(videoRef.current, canvasRef.current, application, transformedCanvasRef.current, solutionCanvasRef.current, transformedSolutionCanvasRef.current, batchCanvasRef.current)
        }
    }, [])
    

    const loadModel = useCallback(() => {
        loadLayersModel('/models/new_model/model.json').then(loadedModel => {
            application.model = loadedModel
            console.log("model loaded")
        })
        .catch((error: Error) => {
            console.error('Error loading model:', error)
        })
    }, [])


    useEffect(() => {
        loadModel()
        solveWorkerRef.current.onmessage = (event: MessageEvent<number[][]>) => {
            console.log(event.data)
        }
    }, [])


    useEffect(() => {
        if (!transformedSolutionCanvasRef.current || !videoRef.current || !canvasRef.current) {
            throw new Error("Ref is not used correctly")
        }
        transformedSolutionCanvasRef.current.width = videoRef.current.videoWidth
        transformedSolutionCanvasRef.current.height = videoRef.current.videoHeight
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
    }, [application.cameraState])

    
    const logSudoku = useCallback(() => {
        console.log(application.sudoku)
    }, [])


    const predict = useCallback(() => {
        if (transformedCanvasRef.current && application.model && batchCanvasRef.current) {
            console.log("yes")
            const img = cv.imread(transformedCanvasRef.current)
            const [batchImagesArray, indices] = sudokuImgToBatchImagesArray(img)
            const prediction = predictBatchImages(batchImagesArray, application.model, indices.length);
            
            (async () => {
                const data = await prediction.data()
                const formatedRaw = []
                for (let i = 0; i < indices.length; i++) {
                    formatedRaw.push(data.slice(i*NUM_CLASSES, (i+1)*NUM_CLASSES))
                }
                const formated = predictionToSudoku(data, indices)
                console.log(formatedRaw)
                console.log(formated)
            })()
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

            const bctx = batchCanvasRef.current.getContext("2d")
            if (bctx) {
                batchCanvasRef.current.width = NUMBER_IMAGE_WIDTH * SUDOKU_WIDTH
                batchCanvasRef.current.height = NUMBER_IMAGE_HEIGHT * SUDOKU_HEIGHT
                bctx.putImageData(imgData, 0, 0)
            }
        }
    }, [])

    return (
        <>
            <div className={styles.sudokuApplication}>
                <div className={styles.cameraWrapper}>
                    <div className={styles.camera}>
                        <CameraFeed videoRef={videoRef} cameraState={application.cameraState} setCameraState={application.setCameraState} callbackFunction={callbackFunction}/>
                        <canvas className={`${styles.overlay} ${application.cameraState == CameraState.Off ? styles.hidden : ""}`} ref={transformedSolutionCanvasRef}></canvas>
                        <CameraButton/>
                    </div>
                </div>
                <canvas ref={canvasRef}></canvas>
                <canvas width={450} height={450} ref={transformedCanvasRef}></canvas>
            </div>
            <canvas width={300} height={300} ref={solutionCanvasRef}></canvas>
            <canvas ref={batchCanvasRef}></canvas>
            <button onClick={logSudoku}>Log sudoku</button>
            <button onClick={predict}>Predict sudoku</button>
            <button onClick={() => {
                solveWorkerRef.current.postMessage(application.sudoku)
            }}>Solve</button>
        </>
    )
}