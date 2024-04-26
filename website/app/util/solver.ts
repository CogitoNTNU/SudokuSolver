/**
 * Solves the given sudoku in-place using recursive backtracking.
 * Returns True if a solution was found, False otherwise.
 */
export function solve(sudoku: Uint8Array): boolean {
    console.log("solving")
    const row_contains: Set<number>[] = Array(9).fill(0).map(() => new Set())
    const col_contains: Set<number>[] = Array(9).fill(0).map(() => new Set())
    const box_contains: Set<number>[] = Array(9).fill(0).map(() => new Set())

    /**
     * Helper function
     * Returns a tuple with the row column and box
     */
    function getPosition(index: number): number[] {
        const row = ~~(index / 9)
        const col = index % 9
        const box = ~~(row / 3) * 3 + ~~(col / 3)

        return [row, col, box]
    }

    // Add existing numbers
    for (let i = 0; i < 81; i++) {
        const [row, col, box] = getPosition(i)
        const num = sudoku[i]

        if (num == 0)
            continue;

        row_contains[row].add(num)
        col_contains[col].add(num)
        box_contains[box].add(num)
    }

    /**
     * Recursive solve function
     */
    function _solve(index: number): boolean {

        // Loop until next empty cell
        let [row, col, box] = getPosition(index)
        while (sudoku[index] != 0) {
            index++;
            [row, col, box] = getPosition(index)
            if (index >= 81)
                return true
        }

        // Get invalid numbers for cell
        const invalid_numbers: Set<number> = new Set([...Array.from(row_contains[row]), ...Array.from(col_contains[col]), ...Array.from(box_contains[box])])

        // If no number is avaliable, backtrack
        if (invalid_numbers.size == 9)
            return false

        // Try all numbers
        for (let num = 1; num < 10; num++) {
            if (invalid_numbers.has(num))
                continue

            sudoku[index] = num
            row_contains[row].add(num)
            col_contains[col].add(num)
            box_contains[box].add(num)

            if (_solve(index))
                return true

            row_contains[row].delete(num)
            col_contains[col].delete(num)
            box_contains[box].delete(num)
        }
        sudoku[index] = 0
        return false
    }

    // Call recursive function 
    return _solve(0)
}
