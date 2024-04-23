"use server"
import prisma from "@/prisma/prisma"

export async function handleForm(formData: FormData) {
    const values = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

    const labels = []

    for (let i = 0; i < values.length; i++) {
        if (formData.has(values[i])) {
            labels.push(i)
        }
    }

    const images = await prisma.image.findMany({
        where: {
            label: {
                in: labels
            }
        }
    })
    
    return images
}