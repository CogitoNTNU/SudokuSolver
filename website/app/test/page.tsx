"use client"
import styles from "./page.module.scss"
import { useEffect, useState, useRef } from "react"
import { loadLayersModel, LayersModel, tensor2d } from "@tensorflow/tfjs"
import cv from "@techstark/opencv-js"
import { NUMBER_IMAGE_HEIGHT, NUMBER_IMAGE_WIDTH, NUMBER_IMAGE_SIZE, SUDOKU_HEIGHT, SUDOKU_WIDTH, SUDOKU_SIZE } from "../context/sudokuApplication/types"
import { sudokuImgToBatchImagesArray } from "../util/image"


export default function Page() {
  const [model, setModel] = useState<LayersModel | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    async function loadModel() {
      try {
        const loadedModel = await loadLayersModel('/models/model/model.json')
        setModel(loadedModel)
        console.log('Model loaded successfully')
      } catch (error) {
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
    
    ctx.drawImage(image, 0, 0)
    
    const img = cv.imread(canvas)
    const batchImagesArray = sudokuImgToBatchImagesArray(img)
    img.delete()

    const batchImagesTensor = tensor2d(batchImagesArray, [SUDOKU_SIZE, NUMBER_IMAGE_SIZE])
    const predictionData = batchImagesTensor.reshape([SUDOKU_SIZE, NUMBER_IMAGE_WIDTH, NUMBER_IMAGE_HEIGHT, 1])
    const prediction = model.predict(predictionData)
    predictionData.dispose()

    if (!Array.isArray(prediction)) {
      (async () => {
        const data = await prediction.data()
        console.log(data)
      })()
    }
    
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
      <img ref={imageRef} className={styles.hidden} src="/square.jpg" alt="" />
      <button onClick={btnClick}>Trykk på meg</button>
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}