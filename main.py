import tensorflow as tf
import numpy as np
import cv2
from pathlib import Path
from imageUtil import getImageSection, getTransformedImageSection
from solver import solve

sudoku_recognizer = ... # Load sudoku recognizer model
number_recognizer = ... # Load number recognizer model

img_path = Path(__file__).parent / "img/skewed.png"
img = cv2.imread(str(img_path))


"""
TODO
Vi ønsker å kunne laste inn et bilde som inneholder en sudoku, og finne ut hvor på bildet denne sudokuen er.
Bruk sudoku_recognizer til å finne hjørnepunktene til sudokuen.
"""

corner_points = np.array([[1110, 710], [1935, 1620], [1740, 3115], [600, 3140]], dtype=np.float32)
img = getTransformedImageSection(img, corner_points, 700, 700)

sudoku = np.zeros((9, 9), dtype=int)

for y in range(9):
    for x in range(9):
        tile = getImageSection(img, x, y, 9, 9)

        """
        TODO
        Konverter tile til et format som passer inn i number_recognizer
        Bruk number_recognizer til å finne ut hvilket tall som er i ruten
        Plasser tallet i sudoku
        """


solve(sudoku)
print(sudoku)
