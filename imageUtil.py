import numpy as np
import cv2


def getImageSection(img: np.ndarray, x: int, y: int, x_sections: int, y_sections: int) -> np.ndarray:
    """
    TODO
    Funksjonen skal returnere en seksjon av img.
    x_sections er antall seksjoner i x-retning på bildet.
    y_sections er antall seksjoner i y-retning på bildet.
    x og y er hvilken seksjon som skal returneres.
    """


def getTransformedImageSection(img: np.ndarray, points: list[list[int]], width: int, height: int) -> np.ndarray:
    output_points = np.array([[0, 0], [width, 0], [width, height], [0, width]], dtype=np.float32)
    transformation_matrix = cv2.getPerspectiveTransform(points, output_points)
    return cv2.warpPerspective(img, transformation_matrix, (width, height))


def drawSudokuSolution(img: np.ndarray, points: list[list[int]], sudoku: np.ndarray) -> np.ndarray:
    """
    TODO
    Funksjonen skal returnere et bilde der løsningen av sudokuen har blitt tegnet på bildet.
    """