"use client"
import cv from "@techstark/opencv-js";
import { MutableRefObject } from 'react';

export function getCorners(photoRef: MutableRefObject<HTMLCanvasElement | null>): number[][] | void {
    const photo = photoRef.current
    if (!photo) return

    const img = cv.imread(photo)
    console.log(img)
}