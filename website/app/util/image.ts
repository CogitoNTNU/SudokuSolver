"use client"
import cv from "@techstark/opencv-js"
import { SudokuApplication, NUMBER_IMAGE_WIDTH, NUMBER_IMAGE_HEIGHT, NUMBER_IMAGE_SIZE, SUDOKU_WIDTH, SUDOKU_HEIGHT, SUDOKU_SIZE } from "../context/sudokuApplication/Types"
import { predictBatchImages } from "./model"
import { sortPointsRadially } from "./sort"


export function drawVideoOnCanvas(video: HTMLVideoElement, canvas: HTMLCanvasElement, application: SudokuApplication, transformedCanvas: HTMLCanvasElement, solutionCanvas: HTMLCanvasElement, transformedSolutionCanvas: HTMLCanvasElement, batchCanvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    const bctx = batchCanvas.getContext("2d")
    if (!ctx || !bctx) {
        throw new Error("Could not get context from canvas")
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    if (canvas.width == 0 || canvas.height == 0) {
        return
    }
    
    const img = cv.imread(canvas)
    const sudokuCorners = getCorners(img, canvas)

    // Use detected corners if available
    if (sudokuCorners && application.model) {
        sortPointsRadially(sudokuCorners)
        const flatPoints = sudokuCorners.flat()
        const transformedImg = new cv.Mat()
        transformImgSection(img, transformedImg, flatPoints, [0, 0, transformedCanvas.width, 0, transformedCanvas.height, transformedCanvas.width, 0, transformedCanvas.height], new cv.Size(transformedCanvas.width, transformedCanvas.height))
        cv.imshow(transformedCanvas, transformedImg)

        const [batchImagesArray, indices] = sudokuImgToBatchImagesArray(transformedImg)
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

        batchCanvas.width = NUMBER_IMAGE_WIDTH * SUDOKU_WIDTH
        batchCanvas.height = NUMBER_IMAGE_HEIGHT * SUDOKU_HEIGHT
        bctx.putImageData(imgData, 0, 0)

        const prediction = predictBatchImages(batchImagesArray, application.model, indices.length);

        (async () => {
            const data = await prediction.data()

            for (let i = 0; i < indices.length; i++) {
                let bestGuess = 0
                let bestProbabilty = 0
                for (let j = 0; j < 9; j++) {
                    const probabilty = data[i*9+j]
                    if (probabilty > bestProbabilty) {
                        bestGuess = j
                        bestProbabilty = probabilty
                    }
                }
                if (bestProbabilty > application.probability[i]) {
                    application.sudoku[indices[i]] = bestGuess
                    application.probability[indices[i]] = bestProbabilty
                }
            }
            drawSolutionOnCanvas(application.sudoku, solutionCanvas)

            const solutionImg = cv.imread(solutionCanvas)
            const transformedSolutionImg = new cv.Mat()
            const solutionCorners = [0, 0, solutionImg.cols, 0, solutionImg.cols, solutionImg.rows, 0, solutionImg.rows] 
            transformImgSection(solutionImg, transformedSolutionImg, solutionCorners, sudokuCorners.flat(), new cv.Size(video.videoWidth, video.videoHeight))
            
            cv.imshow(transformedSolutionCanvas, transformedSolutionImg)
            solutionImg.delete()
            transformedSolutionImg.delete()

        })()

        
        transformedImg.delete()
    }

    img.delete()
}


export function getCorners(img: cv.Mat, canvas: HTMLCanvasElement): number[][] | null {
    const outputImg = new cv.Mat()
    cv.GaussianBlur(img, outputImg, new cv.Size(7, 7), 1.75)
    cv.cvtColor(outputImg, outputImg, cv.COLOR_RGBA2GRAY, 0)
    cv.adaptiveThreshold(outputImg, outputImg, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2)
    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()
    cv.findContours(outputImg, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    let bestApprox = null
    let maxArea = 0
    const minArea = 0.1 * canvas.width * canvas.height

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
    cv.imshow(canvas, outputImg)    
    outputImg.delete()
    contours.delete()
    hierarchy.delete()

    if (bestApprox) {
        const points: number[][] = []
        for (let i = 0; i < bestApprox.rows; i++) {
            points.push([bestApprox.data32S[i*2], bestApprox.data32S[i*2 + 1]])
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


export function drawSolutionOnCanvas(solution: Uint8Array, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    if (!ctx) {
        console.error("Could not get 2d context from canvas")
        return 
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const size = canvas.width / 9
    ctx.fillStyle = "black"
    ctx.font = `${size}px monospace`;

    for (let i = 0; i < SUDOKU_SIZE; i++) {
        if (solution[i] != 0) {
            ctx.fillText(solution[i].toString(), size*(i%9) + size*0.2, size*(Math.floor(i/9)+1) -size*0.1)
        }
    }
}


export function sudokuImgToBatchImagesArray(img: cv.Mat): [Float32Array, number[]] {
    const batchImagesArray = new Float32Array(SUDOKU_SIZE * NUMBER_IMAGE_SIZE)

    const resizedImg = new cv.Mat()
    cv.resize(img, resizedImg, new cv.Size(SUDOKU_WIDTH*NUMBER_IMAGE_WIDTH, SUDOKU_HEIGHT*NUMBER_IMAGE_HEIGHT))

    cv.cvtColor(resizedImg, resizedImg, cv.COLOR_BGR2GRAY)
    cv.bitwise_not(resizedImg, resizedImg)

    const dilateKernelSize = 2
    const dilateKernel = cv.Mat.ones(dilateKernelSize, dilateKernelSize, cv.CV_8U)

    const indices: number[] = []
    
    for (let y = 0; y < SUDOKU_HEIGHT; y++) {
        for (let x = 0; x < SUDOKU_WIDTH; x++) {
            const rect = resizedImg.roi(new cv.Rect(x*NUMBER_IMAGE_WIDTH,y*NUMBER_IMAGE_HEIGHT,NUMBER_IMAGE_WIDTH, NUMBER_IMAGE_HEIGHT))
            
            setBorder(rect, 3, 0)
            cv.dilate(rect, rect, dilateKernel)

            const mean = cv.mean(rect)[0]
            const thresh = mean + 60
            filter(rect, rect, thresh, 255)
            
            if (cv.mean(rect)[0] < 5) {
                rect.delete()
                continue
            }
            
            rect.convertTo(rect, cv.CV_32F, 1 / 255)
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
