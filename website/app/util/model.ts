import { LayersModel, tensor2d } from "@tensorflow/tfjs"
import { NUMBER_IMAGE_WIDTH, NUMBER_IMAGE_HEIGHT, NUMBER_IMAGE_SIZE, SUDOKU_WIDTH, SUDOKU_HEIGHT, NUM_CLASSES } from "../context/sudokuApplication/Types"


export function predictBatchImages(batchImagesArray: Float32Array, model: LayersModel, n: number) {
    const batchImagesTensor = tensor2d(batchImagesArray, [n, NUMBER_IMAGE_SIZE])
    const predictionData = batchImagesTensor.reshape([n, NUMBER_IMAGE_WIDTH, NUMBER_IMAGE_HEIGHT, 1])
    const prediction = model.predict(predictionData)
    predictionData.dispose()
    if (Array.isArray(prediction)) {
        throw new Error("Prediction data is an array")
    }
    return prediction
}


export function formatPredictionData(data: Float32Array | Int32Array | Uint8Array, indices: number[]) {
    const predictions: number[][][] = []
    for (let y = 0; y < SUDOKU_HEIGHT; y++) {
        predictions.push([])
        for (let x = 0; x < SUDOKU_WIDTH; x++) {
            predictions[y].push([])
            for (let i = 0; i < NUM_CLASSES; i++) {
                predictions[y][x].push(0)
            }
        }
    }
    for (let i = 0; i < indices.length; i++) {
        let y = Math.floor(indices[i]/SUDOKU_WIDTH)
        let x = indices[i]%SUDOKU_WIDTH
        for (let j = 0; j < NUM_CLASSES; j++) {
            predictions[y][x][j] = data[indices[i]*9+j]
        }
    }
    return predictions
}