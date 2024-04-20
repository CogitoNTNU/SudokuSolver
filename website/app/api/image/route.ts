import prisma from "@/prisma/prisma"

export async function GET() {
    const images = await prisma.image.findMany()
    return new Response(JSON.stringify(images))
}