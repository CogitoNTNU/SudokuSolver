import { solve } from "@/app/util/solver"

addEventListener("message", (event: MessageEvent<Uint8Array>) => {
    for (let i = 0; i < 81; i++) {
        event.data[i] = i
    }
    postMessage(event.data)
})