import prisma from "@/prisma/prisma"

export async function GET(request: Request) {
    const url = new URL(request.url)
    const params = url.searchParams

    if (params.has("all")) {
        const images = await prisma.image.findMany()
        return new Response(JSON.stringify(images))
    }
    
    const id = params.get("id")

    if (id) {
        if (params.has("gt")) {
            const image = await prisma.image.findFirst({
                where: {
                    id: { gt: parseInt(id) },
                    OR: [
                        { label: { equals: 255 } }
                    ]
                }
            })
            return new Response(JSON.stringify(image))
        }
        const image = await prisma.image.findUnique({
            where: {
                id: parseInt(id)
            }
        })
        return new Response(JSON.stringify(image))
    }
}