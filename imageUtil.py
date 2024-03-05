from typing import Optional
import numpy as np
import cv2


def findSudokuCorners(img: cv2.typing.MatLike) -> Optional[list[list[int]]]:
    """
    Attempts to find a sudoku board within a given image.
    If it succeeds, returns a list containing the position of the sudokus
    corners on the image, otherwise it returns None.
    """

    # Apply grayscaling
    img = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    # Apply gaussian blur
    img = cv2.GaussianBlur(img, (7, 7), 1.75)

    # Apply adaptive tresholding
    img = cv2.adaptiveThreshold(
        img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)

    # Find a list of all contours
    contours, _ = cv2.findContours(
        img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Find the biggest contour
    biggestContour = None
    biggestArea = 0

    # Ignore contours smaller than 1/16 of the image
    minArea = img.shape[0] * img.shape[1] // 16

    for contour in contours:

        # Approximate the contour
        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.02 * peri, True)

        # Ignore contours which dont have exactly 4 corners
        if len(approx) != 4:
            continue

        # Calculate the contour area
        area = cv2.contourArea(approx)

        # Ignore contours smaller minArea
        if area < minArea:
            continue

        # Save the biggest contour
        if area > biggestArea:
            biggestContour = approx
            biggestArea = area

    # Return None if nothing was found
    if biggestContour is None:
        return None

    # Arrange contour coordinates in a list[list[int]]
    points = list(biggestContour.ravel())
    return [points[i:i + 2] for i in range(0, len(points), 2)]


def getImageSection(img: np.ndarray, x: int, y: int, x_sections: int, y_sections: int) -> np.ndarray:
    """
    TODO
    Funksjonen skal returnere en seksjon av img.
    x_sections er antall seksjoner i x-retning på bildet.
    y_sections er antall seksjoner i y-retning på bildet.
    x og y er hvilken seksjon som skal returneres.
    """


def getTransformedImageSection(img: np.ndarray, points: list[list[int]], width: int, height: int) -> np.ndarray:
    output_points = np.array(
        [[0, 0], [width, 0], [width, height], [0, width]], dtype=np.float32)
    transformation_matrix = cv2.getPerspectiveTransform(points, output_points)
    return cv2.warpPerspective(img, transformation_matrix, (width, height))


def drawSudokuSolution(img: np.ndarray, points: list[list[int]], sudoku: np.ndarray) -> np.ndarray:
    """
    TODO
    Funksjonen skal returnere et bilde der løsningen av sudokuen har blitt tegnet på bildet.
    """
