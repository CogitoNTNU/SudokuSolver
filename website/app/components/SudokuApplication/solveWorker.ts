import { solve } from "@/app/util/solver"


addEventListener("message", (event: MessageEvent<Uint8Array>) => {
    solve(event.data)
    postMessage(event.data)
})
