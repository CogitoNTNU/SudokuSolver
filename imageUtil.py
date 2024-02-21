import numpy as np
from PIL import Image


def getImageSection(img: Image.Image, x: int, y: int, x_sections: int, y_sections: int) -> Image.Image:
    """
    TODO
    Funksjonen skal returnere en seksjon av img.
    x_sections er antall seksjoner i x-retning på bildet.
    y_sections er antall seksjoner i y-retning på bildet.
    x og y er hvilken seksjon som skal returneres.
    """


def getTransformedImageSection(img: Image.Image, points: list[list[int]], width: int, height: int) -> Image.Image:
    """
    TODO
    Tanken bak denne funksjonen er at den skal ta inn et bilde som inneholder en sudoku,
    muligens rotert, og returnere et kvadrat av denne sudokuen.
    points skal være en liste med fire punkt, ett punkt for hvert hjørne i sudokuen.
    width og height er størrelsen på bildet som returneres.
    """


def drawSudokuSolution(img: Image.Image, points: list[list[int]], sudoku: np.ndarray) -> Image.Image:
    """
    TODO
    Funksjonen skal returnere et bilde der løsningen av sudokuen har blitt tegnet på bildet.
    """