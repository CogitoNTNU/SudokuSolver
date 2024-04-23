// import prisma from "@/prisma/prisma"

export async function POST(request: Request) {
    const data = request.body
    console.log(data)
    return new Response(JSON.stringify({response: "yes"}))
}
