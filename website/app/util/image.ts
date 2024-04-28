"use client"
import cv from "@techstark/opencv-js"
import { SudokuApplication, NUMBER_IMAGE_WIDTH, NUMBER_IMAGE_HEIGHT, NUMBER_IMAGE_SIZE, SUDOKU_WIDTH, SUDOKU_HEIGHT, SUDOKU_SIZE, SudokuState } from "../context/sudokuApplication/Types"
import { countSudokuDiff, predictBatchImages, processPredictionData } from "./model"
import { sortPointsRadially } from "./sort"
import { processSolution, solve } from "./solve"


export function videoCallback(video: HTMLVideoElement, application: SudokuApplication, transformedSolutionCanvas: HTMLCanvasElement) {
    const frame = getFrame(video)
    const sudokuCorners = getCorners(frame)

    if (sudokuCorners && application.model) {
        sortPointsRadially(sudokuCorners)
        const flatPoints = sudokuCorners.flat()
        const transformedImg = new cv.Mat()
        const transformedImgCorners = [0, 0, SUDOKU_WIDTH*NUMBER_IMAGE_WIDTH, 0, SUDOKU_WIDTH*NUMBER_IMAGE_WIDTH, SUDOKU_HEIGHT*NUMBER_IMAGE_HEIGHT, 0, SUDOKU_HEIGHT*NUMBER_IMAGE_HEIGHT]
        transformImgSection(frame, transformedImg, flatPoints, transformedImgCorners, new cv.Size(SUDOKU_WIDTH*NUMBER_IMAGE_WIDTH, SUDOKU_HEIGHT*NUMBER_IMAGE_HEIGHT))

        const [batchImagesArray, indices] = sudokuImgToBatchImagesArray(transformedImg)
        transformedImg.delete()

        const prediction = predictBatchImages(batchImagesArray, application.model, indices.length);

        (async () => {
            const data = await prediction.data()
            const [sudoku, averageConfidence, worstConfidence] = processPredictionData(data, indices)

            if (averageConfidence > 0.9 && worstConfidence > 0.8) {
                const solution = sudoku.slice()

                if (application.sudokuState == SudokuState.Solved || application.sudokuState == SudokuState.Lost) {
                    const diff = countSudokuDiff(sudoku, application.sudoku)
                    console.log("diff", diff, application.sudoku)
                    if (diff > 10) {
                        if (solve(solution)) {
                            processSolution(solution, sudoku, application)
                        }
                        else {
                            console.log("wrong new solve")
                        }
                    }
                    else {
                        application.setSudokuState(SudokuState.Solved)
                    }
                }
                else if (solve(solution)) {
                    console.log("##########################")
                    console.log("first solve")
                    processSolution(solution, sudoku, application)
                }
                else {
                    console.log("wrong solve")
                }
            }
        })()

        if (application.sudokuState == SudokuState.Solved) {
            const solutionImg = new cv.Mat(450, 450, cv.CV_8UC4)
            solutionImg.setTo(new cv.Scalar(0, 0, 0, 0))
            drawSolutionOnImg(solutionImg, application.solution)
            const transformedSolutionImg = new cv.Mat()
            const solutionCorners = [0, 0, solutionImg.cols, 0, solutionImg.cols, solutionImg.rows, 0, solutionImg.rows]
            transformImgSection(solutionImg, transformedSolutionImg, solutionCorners, flatPoints, new cv.Size(video.videoWidth, video.videoHeight))

            cv.imshow(transformedSolutionCanvas, transformedSolutionImg)
            solutionImg.delete()
            transformedSolutionImg.delete()
        }
    }
    else {
        if (application.sudokuState == SudokuState.Solved) {
            application.setSudokuState(SudokuState.Lost)
            console.log("change to lost", application.sudoku, application.solution)
        }
    }

    frame.delete()
}


export function getCorners(img: cv.Mat): number[][] | null {
    const outputImg = new cv.Mat()
    cv.GaussianBlur(img, outputImg, new cv.Size(7, 7), 1.75)
    cv.cvtColor(outputImg, outputImg, cv.COLOR_RGBA2GRAY, 0)
    cv.adaptiveThreshold(outputImg, outputImg, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2)
    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()
    cv.findContours(outputImg, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    let bestApprox = null
    let maxArea = 0
    const minArea = 0.1 * img.cols * img.rows

    for (let i = 0; i < contours.size(); i++) {
        const cnt = contours.get(i)
        const area = cv.contourArea(cnt)
        if (area > minArea) {
            const peri = cv.arcLength(cnt, true)
            const approx = new cv.Mat()
            cv.approxPolyDP(cnt, approx, 0.02 * peri, true)
            if (approx.rows === 4 && area > maxArea) {
                bestApprox = approx
                maxArea = area
            } else {
                approx.delete()
            }
        }
        cnt.delete()
    }
    outputImg.delete()
    contours.delete()
    hierarchy.delete()

    if (bestApprox) {
        const points: number[][] = []
        for (let i = 0; i < bestApprox.rows; i++) {
            points.push([bestApprox.data32S[i * 2], bestApprox.data32S[i * 2 + 1]])
        }
        bestApprox.delete()
        return points
    } else {
        return null
    }
}


export function transformImgSection(src: cv.Mat, dst: cv.Mat, inputPoints: number[], outputPoints: number[], dSize: cv.Size) {
    const inputMat = cv.matFromArray(4, 1, cv.CV_32FC2, inputPoints)
    const outputMat = cv.matFromArray(4, 1, cv.CV_32FC2, outputPoints)
    const transformationMatrix = cv.getPerspectiveTransform(inputMat, outputMat)

    cv.warpPerspective(src, dst, transformationMatrix, dSize)

    inputMat.delete()
    outputMat.delete()
    transformationMatrix.delete()
}


export function drawSolutionOnImg(img: cv.Mat, solution: Uint8Array) {
    const color = new cv.Scalar(0, 0, 0, 255)
    const fontFace = cv.FONT_HERSHEY_SIMPLEX
    const size = img.cols / SUDOKU_WIDTH
    for (let i = 0; i < SUDOKU_SIZE; i++) {
        if (solution[i] != 0) {
            let x = (i%SUDOKU_WIDTH) * size
            let y = Math.floor(i/SUDOKU_WIDTH) * size
            cv.putText(img, solution[i].toString(), new cv.Point(x + size*0.2, y+size*0.8), fontFace, 1, color, 2)
        }
    }
}


export function sudokuImgToBatchImagesArray(img: cv.Mat): [Float32Array, number[]] {
    const batchImagesArray = new Float32Array(SUDOKU_SIZE * NUMBER_IMAGE_SIZE)

    const resizedImg = new cv.Mat()
    cv.resize(img, resizedImg, new cv.Size(SUDOKU_WIDTH * NUMBER_IMAGE_WIDTH, SUDOKU_HEIGHT * NUMBER_IMAGE_HEIGHT))

    cv.cvtColor(resizedImg, resizedImg, cv.COLOR_BGR2GRAY)
    cv.bitwise_not(resizedImg, resizedImg)

    const dilateKernelSize = 2
    const dilateKernel = cv.Mat.ones(dilateKernelSize, dilateKernelSize, cv.CV_8U)

    const indices: number[] = []

    for (let y = 0; y < SUDOKU_HEIGHT; y++) {
        for (let x = 0; x < SUDOKU_WIDTH; x++) {
            const rect = resizedImg.roi(new cv.Rect(x * NUMBER_IMAGE_WIDTH, y * NUMBER_IMAGE_HEIGHT, NUMBER_IMAGE_WIDTH, NUMBER_IMAGE_HEIGHT))

            setBorder(rect, 5, 0)
            cv.dilate(rect, rect, dilateKernel)

            const mean = cv.mean(rect)[0]
            const thresh = mean + 60
            filter(rect, rect, thresh, 255)

            if (cv.mean(rect)[0] < 5) {
                rect.delete()
                continue
            }

            rect.convertTo(rect, cv.CV_32F, 1 / 255)
            batchImagesArray.set(rect.data32F, (y * SUDOKU_WIDTH + x) * NUMBER_IMAGE_SIZE)
            batchImagesArray.set(rect.data32F, indices.length*NUMBER_IMAGE_SIZE)
            indices.push(y*SUDOKU_WIDTH+x)

            rect.delete()
        }
    }

    dilateKernel.delete()
    resizedImg.delete()
    return [batchImagesArray.slice(0, indices.length*NUMBER_IMAGE_SIZE), indices]
}


export function filter(src: cv.Mat, dst: cv.Mat, thresh: number, maxval: number) {
    const mask = new cv.Mat()
    cv.threshold(src, mask, thresh, maxval, cv.THRESH_BINARY)
    cv.bitwise_and(src, mask, dst)
    mask.delete()
}


export function setBorder(img: cv.Mat, borderSize: number, val: number) {
    let topROI = new cv.Rect(0, 0, img.cols, borderSize)
    let bottomROI = new cv.Rect(0, img.rows - borderSize, img.cols, borderSize)
    let leftROI = new cv.Rect(0, 0, borderSize, img.rows)
    let rightROI = new cv.Rect(img.cols - borderSize, 0, borderSize, img.rows)

    img.roi(topROI).setTo(new cv.Scalar(val))
    img.roi(bottomROI).setTo(new cv.Scalar(val))
    img.roi(leftROI).setTo(new cv.Scalar(val))
    img.roi(rightROI).setTo(new cv.Scalar(val))
}


export function getFrame(video: HTMLVideoElement) {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
        throw new Error("ctx is null")
    }
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    return cv.imread(canvas)
}
