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
        const corners = getCorners(img, canvas)

        // Use detected corners if available
        if (corners && transformedCanvasRef.current) {
            const flatPoints = corners.flat()
            transformImgSection(img, transformedCanvasRef.current, flatPoints); // Use detected corners
        }

        img.delete()
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

    export function transformImgSection(img: cv.Mat, outputCanvas: HTMLCanvasElement, points: number[]) {
        const inputMat = cv.matFromArray(4, 1, cv.CV_32FC2, points)
        // Correct the coordinates for the perspective transformation
        const outputMat = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, outputCanvas.width, 0, outputCanvas.width, outputCanvas.height, 0, outputCanvas.height]);
        const transformationMatrix = cv.getPerspectiveTransform(inputMat, outputMat)
        const outputImg = cv.imread(outputCanvas)

        cv.warpPerspective(img, outputImg, transformationMatrix, new cv.Size(outputCanvas.width, outputCanvas.height))
        cv.imshow(outputCanvas, outputImg)

        outputImg.delete()
    }