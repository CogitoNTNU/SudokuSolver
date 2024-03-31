"use client"
import cv from "@techstark/opencv-js"
import { MutableRefObject } from 'react'

export function drawVideoOnCanvas(videoRef: MutableRefObject<HTMLVideoElement | null>, canvasRef: MutableRefObject<HTMLCanvasElement | null>) {
    if (!videoRef.current) {
        console.error("videoRef.current is null")
        return null
    }
    if (!canvasRef.current) {
        console.error("canvasRef.current is null")
        return null
    }
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) {
        console.error("Could not get 2d context from canvas")
        return null
    }
    const video = videoRef.current
    ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
    getCorners(canvasRef)
  }

export function getCorners(photoRef: MutableRefObject<HTMLCanvasElement | null>): number[][] | null {
    const photo = photoRef.current
    if (!photo) return null

    const img = cv.imread(photo)

    cv.cvtColor(img, img, cv.COLOR_RGB2GRAY)
    cv.GaussianBlur(img, img, new cv.Size(7, 7), 1.75)
    cv.adaptiveThreshold(img, img, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2)

    let contours = new cv.MatVector()
    let hierarchy = new cv.Mat()
    cv.findContours(img, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    // Find the biggest contour
    let biggestContour = undefined
    let biggestArea = 0

    // Ignore contours smaller than 1/16 of the image
    let minArea = Math.floor(img.size().width * img.size().height / 16)

    for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i)
        // Approximate the contour
        const peri = cv.arcLength(contour, true)
        const approx = new cv.Mat()
        cv.approxPolyDP(contour, approx, 0.02 * peri, true)

        // Ignore contours which dont have exactly 4 corners
        if (approx.rows * approx.cols != 4) {
            continue
        }
    
        // Calculate the contour area
        let area = cv.contourArea(approx)
    
        // Ignore contours smaller minArea
        if (area < minArea) {
            continue
        }
    
        // Save the biggest contour
        if (area > biggestArea) {
            biggestContour = approx
            biggestArea = area
        }
        approx.delete()
    }
    
    console.log(biggestContour)

    cv.imshow(photo, img)

    img.delete()
    contours.delete()
    hierarchy.delete()

    // Return None if nothing was found
    if (biggestContour == undefined) {
        return null
    }

    // Arrange contour coordinates in a list[list[int]]
    // return [points[i:i + 2] for i in range(0, len(points), 2)]

    return null
}