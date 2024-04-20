import prisma from "@/prisma/prisma"


export async function POST(request: Request) {
    const data = await request.arrayBuffer()

    const image = await prisma.image.create({
        data: {
            data: Buffer.from(data)
        }
    })

    return new Response(JSON.stringify(image))
}