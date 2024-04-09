import cv2
import numpy as np
from numberRecognizer import NumberRecognizer

# Load model
model = NumberRecognizer()
model.load("sudokuRecognizer/models/21.03.24-09:47:43.keras")

# Load Image
image = cv2.imread("sudokuRecognizer/test.png")
image = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
image = cv2.resize(image, (28, 28))

_, thresh = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY)
cv2.imshow("Thresh", thresh)
cv2.waitKey()
thresh = np.expand_dims(thresh, axis=0)
print(f"Thresh guess: {model.image_to_num(thresh)}")
del thresh

_, image = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY_INV)
cv2.imshow("Thresh inv", image)
cv2.waitKey()
image = np.expand_dims(image, axis=0)
print(f"Thresh inv guess: {model.image_to_num(image)}")
