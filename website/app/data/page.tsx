"use client"


export default function Page() {
    return (
        <>
            <button onClick={async () => {
                const response = await fetch("/api/image", {
                    method: "GET"
                })
                if (response.ok) {
                    console.log(response.json())
                }
            }}>Read all images</button>

            <button onClick={async () => {
                const response = await fetch("api/image/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/octet-stream"
                    },
                    body: Buffer.from(new Float32Array([0.5, 0.8]))
                })
                if (response.ok) {
                    console.log(response.json())
                }
            }}>Create image</button>
        </>
    )
}