"use client"
import cv from "@techstark/opencv-js"
import { MutableRefObject } from 'react'

export function drawVideoOnCanvas(videoRef: MutableRefObject<HTMLVideoElement | null>, canvasRef: MutableRefObject<HTMLCanvasElement | null>, transformedCanvasRef: MutableRefObject<HTMLCanvasElement | null>) {
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
    getCorners(img, canvas)

    const points = [100, 100, 200, 100, 200, 200, 100, 200]
    if (transformedCanvasRef.current) {
        transformImgSection(img, transformedCanvasRef.current, points)
    }

    img.delete()
}


export function getCorners(img: cv.Mat, canvas: HTMLCanvasElement): number[] | null {
    const outputImg = new cv.Mat()
    cv.cvtColor(img, outputImg, cv.COLOR_RGB2GRAY)
    cv.GaussianBlur(outputImg, outputImg, new cv.Size(7, 7), 1.75)
    cv.adaptiveThreshold(outputImg, outputImg, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2)

    cv.imshow(canvas, outputImg)    
    outputImg.delete()

    return null
}

export function transformImgSection(img: cv.Mat, outputCanvas: HTMLCanvasElement, points: number[]) {
    const inputMat = cv.matFromArray(4, 1, cv.CV_32FC2, points)
    const outputMat = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, outputCanvas.width, 0, outputCanvas.width, outputCanvas.height, 0, outputCanvas.width])
    const transformationMatrix = cv.getPerspectiveTransform(inputMat, outputMat)
    const outputImg = cv.imread(outputCanvas)

    cv.warpPerspective(img, outputImg, transformationMatrix, new cv.Size(outputCanvas.width, outputCanvas.height))
    cv.imshow(outputCanvas, outputImg)

    outputImg.delete()
}