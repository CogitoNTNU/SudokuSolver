"use client"
import cv from "@techstark/opencv-js"
import { MutableRefObject } from 'react'

export function drawVideoOnCanvas(videoRef: MutableRefObject<HTMLVideoElement | null>, canvasRef: MutableRefObject<HTMLCanvasElement | null>, transformedCanvasRef: MutableRefObject<HTMLCanvasElement | null>, solutionCanvasRef: MutableRefObject<HTMLCanvasElement | null>, transformedSolutionCanvasRef: MutableRefObject<HTMLCanvasElement | null>) {
    if (!videoRef.current) {
        console.error("videoRef.current is null")
        return null
    }
    if (!canvasRef.current) {
        console.error("canvasRef.current is null")
        return null
    }
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) {
        console.error("Could not get 2d context from canvas")
        return null
    }

    const video = videoRef.current
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    const img = cv.imread(canvas)
    const sudokuCorners = getCorners(img, canvas)

    // Use detected corners if available
    if (sudokuCorners && transformedCanvasRef.current) {
        const flatPoints = sudokuCorners.flat()
        const transformedImg = new cv.Mat()
        transformImgSection(img, transformedImg, flatPoints, [0, 0, img.cols, 0, img.cols, img.rows, 0, img.rows])
        cv.imshow(transformedCanvasRef.current, transformedImg)
        transformedImg.delete()
    }

    img.delete()

    const solution = []

    
    if (solutionCanvasRef.current) {
        for (let i = 0; i < 81; i++) {
            solution.push(i%9+1)
        }
        drawSolutionOnCanvas(solution, solutionCanvasRef.current)

        if (transformedSolutionCanvasRef.current && sudokuCorners) {
            const solutionImg = cv.imread(solutionCanvasRef.current)
            const transformedSolutionImg = new cv.Mat()
            const solutionCorners = [0, 0, solutionImg.cols, 0, solutionImg.cols, solutionImg.rows, 0, solutionImg.rows] 
            transformImgSection(solutionImg, transformedSolutionImg, solutionCorners, sudokuCorners.flat())
            cv.imshow(transformedSolutionCanvasRef.current, transformedSolutionImg)
            solutionImg.delete()
            transformedSolutionImg.delete()
        }
    }

}


export function getCorners(img: cv.Mat, canvas: HTMLCanvasElement): number[][] | null {
    const outputImg = new cv.Mat()
    cv.GaussianBlur(img, outputImg, new cv.Size(7, 7), 1.75);
    cv.cvtColor(outputImg, outputImg, cv.COLOR_RGBA2GRAY, 0);
    cv.adaptiveThreshold(outputImg, outputImg, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);
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


export function transformImgSection(src: cv.Mat, dst: cv.Mat, inputPoints: number[], outputPoints: number[]) {
    const inputMat = cv.matFromArray(4, 1, cv.CV_32FC2, inputPoints)
    const outputMat = cv.matFromArray(4, 1, cv.CV_32FC2, outputPoints)
    const transformationMatrix = cv.getPerspectiveTransform(inputMat, outputMat)

    cv.warpPerspective(src, dst, transformationMatrix, dst.size())

    inputMat.delete()
    outputMat.delete()
    transformationMatrix.delete()
}


export function drawSolutionOnCanvas(solution: number[], canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    if (!ctx) {
        console.error("Could not get 2d context from canvas")
        return 
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const size = canvas.width / 9
    ctx.fillStyle = "black"
    ctx.font = `${size}px monospace`;

    for (let i = 0; i < 81; i++) {
        if (solution[i] != 0) {
            ctx.fillText(solution[i].toString(), size*(i%9) + size*0.2, size*(Math.floor(i/9)+1) -size*0.1)
        }
    }
}