import numpy as np


def solve(sudoku: np.ndarray) -> bool:
    """
    Solves the given sudoku in-place using recursive backtracking.
    Returns True if a solution was found, False otherwise.
    """

    row_contains: list[set[int]] = [set() for _ in range(9)]
    col_contains: list[set[int]] = [set() for _ in range(9)]
    box_contains: list[set[int]] = [set() for _ in range(9)]

    # Helper function
    # Returns a tuple with the row column and box
    def getPosition(index: int) -> tuple[int, int, int]:
        row = index // 9
        col = index % 9
        box = (row // 3) * 3 + col // 3

        return (row, col, box)

    # Add existing numbers
    for i in range(81):
        row, col, box = getPosition(i)
        num: int = sudoku[row, col]

        if num == 0:
            continue

        row, col, box = getPosition(i)
        row_contains[row].add(num)
        col_contains[col].add(num)
        box_contains[box].add(num)

    # Recursive solve function
    def _solve(index: int) -> bool:

        # Loop until next empty cell
        row, col, box = getPosition(index)
        while sudoku[row, col] != 0:
            index += 1
            row, col, box = getPosition(index)
            if index >= 81:
                return True

        # Get invalid numbers for cell
        invalid_numbers: set[int] = row_contains[row] \
            | col_contains[col] \
            | box_contains[box]

        # If no number is available, backtrack
        if len(invalid_numbers) == 9:
            return False

        # Try all numbers
        for num in range(1, 10):
            if num in invalid_numbers:
                continue

            sudoku[row, col] = num
            row_contains[row].add(num)
            col_contains[col].add(num)
            box_contains[box].add(num)

            if (_solve(index)):
                return True

            row_contains[row].discard(num)
            col_contains[col].discard(num)
            box_contains[box].discard(num)

        sudoku[row, col] = 0
        return False

    return _solve(0)
