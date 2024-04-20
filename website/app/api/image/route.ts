import prisma from "@/prisma/prisma"

export async function GET(request: Request) {
    const url = new URL(request.url)
    const params = url.searchParams

    if (params.has("all")) {
        const images = await prisma.image.findMany()
        return new Response(JSON.stringify(images))
    }
    
    if (params.has("id")) {
        const id = params.get("id")
        if (id) {
            const image = await prisma.image.findUnique({
                where: {
                    id: parseInt(id)
                }
            })
            return new Response(JSON.stringify(image))
        }
    }

    console.log(request.body)
}