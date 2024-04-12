export function sortPointsRadially(points: number[][]) {
    const center: number[] = points.reduce((acc, curr) => [curr[0] + acc[0], curr[1] + acc[1]], [0, 0])
    center[0] /= points.length
    center[1] /= points.length
    points.sort((a: number[], b: number[]) => {
        return Math.atan2(a[1] - center[1], a[0] - center[0]) - Math.atan2(b[1] - center[1], b[0] - center[0])
    })
}