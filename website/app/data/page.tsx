"use client"
import styles from "./page.module.scss"
import Link from "next/link"
import { NUMBER_IMAGE_HEIGHT, NUMBER_IMAGE_SIZE, NUMBER_IMAGE_WIDTH } from "../context/sudokuApplication/Types"
import { useCallback, useEffect, useRef, useState } from "react"
import { handleForm } from "./handleForm"


export default function Page() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [id, setId] = useState(0)
    const [labelVal, setLabelVal] = useState(0)
    const [images, setImages] = useState<{
        id: number;
        data: Buffer;
        label: number | null;
    }[]>([])

    const handleKeyPress = useCallback(async (event: KeyboardEvent) => {
        let label = parseInt(event.key)
        if (isNaN(label)) return;
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

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
    
        const form = event.currentTarget
        const formData = new FormData(form)

        const images = await handleForm(formData)
        setImages(images)
    }

    useEffect(() => {
        document.addEventListener("keydown", handleKeyPress)
        return () => {
            document.removeEventListener("keydown", handleKeyPress)
        }
    }, [handleKeyPress])

    return (
        <div className={styles.wrapper}>
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
                    console.log("downloading")

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
            <form action="/api/image/filter" method="POST" onSubmit={handleSubmit}>
                <label><input type="checkbox" name="0" />0</label>
                <label><input type="checkbox" name="1" />1</label>
                <label><input type="checkbox" name="2" />2</label>
                <label><input type="checkbox" name="3" />3</label>
                <label><input type="checkbox" name="4" />4</label>
                <label><input type="checkbox" name="5" />5</label>
                <label><input type="checkbox" name="6" />6</label>
                <label><input type="checkbox" name="7" />7</label>
                <label><input type="checkbox" name="8" />8</label>
                <label><input type="checkbox" name="9" />9</label>
                <button type="submit">Hent bilder</button>
            </form>
            <CanvasList images={images} />
        </div>
    )
}


function CanvasList({ images }: { images: {
    id: number;
    data: Buffer;
    label: number | null;
}[]}) {
    return (
      <div>
        {images.map((image) => (
          <canvas id={String(image.id)} key={image.id} width={NUMBER_IMAGE_WIDTH} height={NUMBER_IMAGE_HEIGHT} ref={(canvas) => {renderImageOnCanvas(canvas, image)}}></canvas>
        ))}
      </div>
    )
}

function renderImageOnCanvas(canvas: HTMLCanvasElement | null, image: {
    id: number;
    data: Buffer;
    label: number | null;
}){
    if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
            const imgData = new ImageData(NUMBER_IMAGE_WIDTH, NUMBER_IMAGE_HEIGHT)
            const data = new Uint8Array(image.data.data)
            for (let i = 0; i < NUMBER_IMAGE_SIZE; i++) {
                imgData.data[i*4] = data[i]
                imgData.data[i*4+1] = data[i]
                imgData.data[i*4+2] = data[i]
                imgData.data[i*4+3] = 255
            }
            ctx.putImageData(imgData, 0, 0)
        }

    }
  }
