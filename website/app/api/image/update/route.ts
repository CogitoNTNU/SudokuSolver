import prisma from "@/prisma/prisma"


export async function POST(request: Request) {
    const url = new URL(request.url)
    const params = url.searchParams

    const id = params.get("id")
    const label = params.get("label")

    console.log(id, label)

    if (id && label) {
        const image = await prisma.image.update({
            where: {
                id: parseInt(id)
            },
            data: {
                label: parseInt(label)
            }
        })
        return new Response(JSON.stringify(image))
    }
    else {
        console.log("bad data")
        console.log(request)
    }
}