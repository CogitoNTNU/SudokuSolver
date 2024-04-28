import { solve } from "@/app/util/solve"


addEventListener("message", (event: MessageEvent<Uint8Array>) => {
    solve(event.data)
    postMessage(event.data)
})
