"use client"
import Link from "next/link"
import { NUMBER_IMAGE_HEIGHT, NUMBER_IMAGE_SIZE, NUMBER_IMAGE_WIDTH } from "../context/sudokuApplication/Types"
import { useCallback, useEffect, useRef, useState } from "react"


export default function Page() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [id, setId] = useState(0)
    const [labelVal, setLabelVal] = useState(0)

    const handleKeyPress = useCallback(async (event: KeyboardEvent) => {
        let label = parseInt(event.key)
        fetch(`/api/image/update?id=${id}&label=${label}`, {
            method: "POST"
        })
        const response = await fetch(`/api/image?id=${id}&gt=true`, {
            method: "GET"
        })
        if (response.ok) {
            (async () => {
                const result = await response.json()
                displayImage(result)
                console.log(result)
                setId(result.id)
            })()
        }
    }, [id])

    async function displayImage(result: {data: {data: Buffer}, label: number}) {
        const data = result.data.data
        const label = result.label
        setLabelVal(label ? label : 255)
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

    useEffect(() => {
        document.addEventListener("keydown", handleKeyPress)
        return () => {
            document.removeEventListener("keydown", handleKeyPress)
        }
    }, [handleKeyPress])

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
                    link.download = "labels.bin"

                    document.body.appendChild(link)
                    link.click()

                    URL.revokeObjectURL(labelsUrl)
                    const digitsBlob = new Blob([digitsData], { type: 'application/octet-stream' })

                    const digitsUrl = URL.createObjectURL(digitsBlob)

                    link.href = digitsUrl
                    link.download = "digits.bin"

                    link.click()

                    document.body.removeChild(link)
                    URL.revokeObjectURL(digitsUrl)
                }
            }}>Last ned data</button>
            <input type="number" value={id} onChange={async event => {
                const val = parseInt(event.target.value)
                if (val != id) {
                    setId(val)
                    const response = await fetch(`/api/image?id=${val}`, {
                        method: "GET"
                    })
                    if (response.ok) {
                        (async () => {
                            const result = await response.json()
                            displayImage(result)
                        })()
                    }
                }
            }}/>
            <canvas ref={canvasRef} width={28} height={28}></canvas>
            <p>{labelVal}</p>
        </>
    )
}