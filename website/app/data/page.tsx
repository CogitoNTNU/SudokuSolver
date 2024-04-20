"use client"
import Link from "next/link"
import { NUMBER_IMAGE_HEIGHT, NUMBER_IMAGE_SIZE, NUMBER_IMAGE_WIDTH } from "../context/sudokuApplication/Types"
import { useCallback, useEffect, useRef, useState } from "react"


export default function Page() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [id, setId] = useState(0)

    const handleKeyPress = useCallback(async (event: KeyboardEvent) => {
        console.log(event)
        const label = parseInt(event.key)
        const response = await fetch(`/api/image/update?id=${id}&label=${label}`, {
            method: "GET"
        })
        console.log(response)
        const newId = id+1
        setId(newId)
        displayImage(newId)
    }, [id])

    async function displayImage(n: number) {
        const response = await fetch(`/api/image?id=${n}`, {
            method: "GET"
        })
        if (response.ok) {
            const result = await response.json()
            const data = result.data.data
            const imgData = new ImageData(NUMBER_IMAGE_WIDTH, NUMBER_IMAGE_HEIGHT)
            for (let i = 0; i < NUMBER_IMAGE_SIZE; i++) {
                imgData.data[i*4] = data[i]
                imgData.data[i*4+1] = data[i]
                imgData.data[i*4+2] = data[i]
                imgData.data[i*4+3] = 255
            }
            const canvas = canvasRef.current
            if (canvas) {
                const ctx = canvas.getContext("2d")
                if (ctx) {
                    ctx.putImageData(imgData, 0, 0)
                }
            }
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", handleKeyPress)
        return () => {
            document.removeEventListener("keydown", handleKeyPress)
        }
    }, [])

    return (
        <>
            <Link href={"/data/create"}>
                <button>Lag ny data</button>
            </Link>
            <button onClick={async () => {
                const response = await fetch("/api/image?all=true", {
                    method: "GET"
                })
                if (response.ok) {
                    const result = await response.json()
                    console.log(result)
                    const digitsData = new Uint8Array(result.length*NUMBER_IMAGE_SIZE)
                    const labelData = new Uint8Array(result.length)

                    for (let i = 0; i < result.length; i++) {
                        digitsData.set(result[i].data.data, i*NUMBER_IMAGE_SIZE)
                        if (result[i].label == null) {
                            labelData[i] = 255
                        }
                        else {
                            labelData[i] = parseInt(result[i].label)
                        }
                    }

                    const labelBlob = new Blob([labelData], { type: 'application/octet-stream' })

                    const labelsUrl = URL.createObjectURL(labelBlob)

                    const link = document.createElement('a')
                    link.href = labelsUrl
                    link.download = "labels"

                    document.body.appendChild(link)
                    link.click()

                    URL.revokeObjectURL(labelsUrl)
                    const digitsBlob = new Blob([digitsData], { type: 'application/octet-stream' })

                    const digitsUrl = URL.createObjectURL(digitsBlob)

                    link.href = digitsUrl
                    link.download = "digits"

                    link.click()

                    document.body.removeChild(link)
                    URL.revokeObjectURL(digitsUrl)
                }
            }}>Last ned data</button>
            <input type="number" value={id} onChange={async event => {
                const val = parseInt(event.target.value)
                console.log("###", val, id)
                if (val != id) {
                    setId(val)
                    displayImage(val)
                }
            }}/>
            <canvas ref={canvasRef} width={28} height={28}></canvas>
        </>
    )
}