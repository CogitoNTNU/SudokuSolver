"use client"
import styles from "./page.module.scss"
import { useEffect, useState, useRef } from "react"
import { loadLayersModel, LayersModel } from "@tensorflow/tfjs"
import cv from "@techstark/opencv-js"
import { NUMBER_IMAGE_HEIGHT, NUMBER_IMAGE_WIDTH, NUMBER_IMAGE_SIZE, SUDOKU_HEIGHT, SUDOKU_WIDTH, SUDOKU_SIZE } from "../context/sudokuApplication/Types"
import { sudokuImgToBatchImagesArray } from "../util/image"
import { predictBatchImages } from "../util/model"
import { formatPredictionData } from "../util/model"


export default function Page() {
const [model, setModel] = useState<LayersModel | null>(null)
const canvasRef = useRef<HTMLCanvasElement | null>(null)
const digitCanvasRef = useRef<HTMLCanvasElement | null>(null)
const imageRef = useRef<HTMLImageElement | null>(null)
const [input, setInput] = useState<number>(0)

useEffect(() => {
    async function loadModel() {
        try {
            const loadedModel = await loadLayersModel('/models/tfjs_model/model.json')
            setModel(loadedModel)
            console.log('Model loaded successfully')
        } 
        catch (error) {
            console.error('Error loading model:', error)
        }
    }

    loadModel()
}, [])


if (!model) {
    return <p>Loading model...</p>
}

function btnClick() {
    if (!canvasRef.current || !imageRef.current || !model) {
        return
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) {
        return
    }
    const image = imageRef.current

    canvas.width = image.width
    canvas.height = image.height
    
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    
    const img = cv.imread(canvas)
    const batchImagesArray = sudokuImgToBatchImagesArray(img)
    img.delete()

    const prediction = predictBatchImages(batchImagesArray, model, SUDOKU_SIZE);

    (async () => {
        const data = await prediction.data()
        console.log(data)
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
    
    canvas.width = NUMBER_IMAGE_WIDTH * SUDOKU_WIDTH
    canvas.height = NUMBER_IMAGE_HEIGHT * SUDOKU_HEIGHT
    ctx.putImageData(imgData, 0, 0)
}

return (
    <div>
        <img ref={imageRef} className={styles.image} src="/square.jpg" alt="" />
        {/* <img ref={imageRef} className={styles.hidden} src="/square.jpg" alt="" /> */}
        <button onClick={btnClick}>Trykk på meg</button>
        <canvas ref={canvasRef}></canvas>
        <div>
            <p>{input}</p>
            <input type="number" min={0} max={80} onChange={event => {
                const value = Number(event.target.value)
                setInput(value)
                if (!canvasRef.current || !digitCanvasRef.current || !imageRef.current || !model) {
                    return
                }
                const canvas = canvasRef.current
                const digitCanvas = digitCanvasRef.current
                const ctx = canvas.getContext("2d")
                const dctx = digitCanvas.getContext("2d")
                if (!ctx || !dctx) {
                    return
                }
                
                const image = imageRef.current
            
                canvas.width = image.width
                canvas.height = image.height
                
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
                
                const img = cv.imread(canvas)
                cv.resize(img, img, new cv.Size(SUDOKU_WIDTH*NUMBER_IMAGE_WIDTH, SUDOKU_HEIGHT*NUMBER_IMAGE_HEIGHT))
                cv.imshow(canvas, img)
                const batchImagesArray = sudokuImgToBatchImagesArray(img)
                img.delete()
                const section = batchImagesArray.slice(NUMBER_IMAGE_SIZE*value, NUMBER_IMAGE_SIZE*(value+1))
    
                const imgData = new ImageData(NUMBER_IMAGE_WIDTH, NUMBER_IMAGE_HEIGHT)
                for (let i = 0; i < NUMBER_IMAGE_SIZE; i++) {
                    const color = section[i]*255
                    imgData.data[i*4] = color
                    imgData.data[i*4+1] = color
                    imgData.data[i*4+2] = color
                    imgData.data[i*4+3] = 255
                }
    
                dctx.putImageData(imgData, 0, 0)
            }}/>
        </div>
        <button onClick={() => {
            if (!canvasRef.current || !digitCanvasRef.current || !imageRef.current || !model) {
                return
            }
            const canvas = canvasRef.current
            const digitCanvas = digitCanvasRef.current
            const ctx = canvas.getContext("2d")
            const dctx = digitCanvas.getContext("2d")
            if (!ctx || !dctx) {
                return
            }
            
            const image = imageRef.current
        
            canvas.width = image.width
            canvas.height = image.height
            
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
            
            const img = cv.imread(canvas)
            cv.resize(img, img, new cv.Size(SUDOKU_WIDTH*NUMBER_IMAGE_WIDTH, SUDOKU_HEIGHT*NUMBER_IMAGE_HEIGHT))
            cv.imshow(canvas, img)
            const batchImagesArray = sudokuImgToBatchImagesArray(img)
            img.delete()
            const section = batchImagesArray.slice(NUMBER_IMAGE_SIZE*input, NUMBER_IMAGE_SIZE*(input+1))

            const imgData = new ImageData(NUMBER_IMAGE_WIDTH, NUMBER_IMAGE_HEIGHT)
            for (let i = 0; i < NUMBER_IMAGE_SIZE; i++) {
                const color = section[i]*255
                imgData.data[i*4] = color
                imgData.data[i*4+1] = color
                imgData.data[i*4+2] = color
                imgData.data[i*4+3] = 255
            }

            dctx.putImageData(imgData, 0, 0)

            const prediction = predictBatchImages(batchImagesArray, model, SUDOKU_SIZE);

            (async () => {
                const data = await prediction.data()
                console.log(data.slice(input*9, (input+1)*9))
            })()

        }
            
        }
        >Predict number</button>
        <canvas ref={digitCanvasRef}></canvas>
    </div>
)
}