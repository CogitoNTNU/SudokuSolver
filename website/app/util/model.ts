"use client"
import { LayersModel, tensor2d } from "@tensorflow/tfjs"
import { NUMBER_IMAGE_WIDTH, NUMBER_IMAGE_HEIGHT, NUMBER_IMAGE_SIZE, SUDOKU_WIDTH, SUDOKU_HEIGHT, SUDOKU_SIZE, NUM_CLASSES } from "../context/sudokuApplication/Types"


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


export function processPredictionData(prediction: Float32Array | Uint8Array | Int32Array, indices: number[]): [Uint8Array, number, number] {
    const sudoku = new Uint8Array(SUDOKU_SIZE)
    let averageBestConfidence = 0
    let worstConfidence = 1

    for (let i = 0; i < prediction.length; i += NUM_CLASSES) {
        let bestGuess = 0;
        let highestConfidence = 0

        for (let j = 0; j < NUM_CLASSES; j++) {
            if (prediction[i + j] > highestConfidence) {
                bestGuess = j
                highestConfidence = prediction[i + j]
            }
        }

        const index = indices[Math.floor(i/NUM_CLASSES)]

        sudoku[index] = bestGuess + 1

        averageBestConfidence += highestConfidence / (prediction.length / NUM_CLASSES)
        if (highestConfidence < worstConfidence) {
            worstConfidence = highestConfidence
        }
    }

    return [sudoku, averageBestConfidence, worstConfidence]
}


export function countSudokuDiff(sudoku1: Uint8Array, sudoku2: Uint8Array): number {
    let count = 0
    for (let i = 0; i < SUDOKU_SIZE; i++) {
        count += +(sudoku1[i] != sudoku2[i])
    }
    return count
}