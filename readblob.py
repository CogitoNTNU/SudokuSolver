import numpy as np
import matplotlib.pyplot as plt


size = 28*28
n = 9


with open("labels", "rb") as file:
    blob = file.read()
    data = np.frombuffer(blob, dtype=np.uint8)
    print(data[n])


with open("digits", "rb") as file:
    blob = file.read()
    data = np.frombuffer(blob, dtype=np.uint8)
    img = data[n*size:(n+1)*size]
    img = img.reshape((28, 28))
    plt.imshow(img, cmap="gray")
    plt.axis("off")
    plt.show()