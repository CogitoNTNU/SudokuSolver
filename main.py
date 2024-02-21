import tensorflow as tf
import numpy as np
from PIL import Image
from pathlib import Path
from imageUtil import getImageSection, getTransformedImageSection
from solver import solve

sudoku_recognizer = ... # Load sudoku recognizer model
number_recognizer = ... # Load number recognizer model

img_path = Path(__file__).parent / "img/square.jpg"
img = Image.open(img_path)

"""
TODO
Vi ønsker å kunne laste inn et bilde som inneholder en sudoku, og finne ut hvor på bildet denne sudokuen er.
Her må vi muligens konvertere bildet til et format som passer inn i sudoku_recognizer
Bruk sudoku_recognizer til å finne hjørnepunktene til sudokuen.
Bruk getTransformedImageSection til å lage et kvadratisk bilde av sudokuen.
"""


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

