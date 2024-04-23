import fs from "fs"
import { PrismaClient } from "@prisma/client"
// import { NUMBER_IMAGE_SIZE } from "@/app/context/sudokuApplication/Types"
const NUMBER_IMAGE_SIZE = 28*28

const prisma = new PrismaClient()

const labelBinary = fs.readFileSync("./prisma/seeding/labels.bin")
const digitsBinary = fs.readFileSync("./prisma/seeding/digits.bin")
const labels = new Uint8Array(labelBinary)
const digits = new Uint8Array(digitsBinary)

labels.forEach(async (label, i) => {
    console.log(label)
    const result = await prisma.image.create({
        data: {
            label,
            data: Buffer.from(digits.slice(i*NUMBER_IMAGE_SIZE, (i+1)*NUMBER_IMAGE_SIZE))
        }
    })
    console.log(result)
})

