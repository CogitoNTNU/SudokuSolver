import tensorflow as tf  # ML part
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Flatten
from tensorflow.keras.datasets import mnist
from sklearn.preprocessing import LabelBinarizer
from datetime import datetime
import numpy as np  # for numpy arrays
import cv2 as cv  # computer vision to load and process images
import os  # interacting w the os
import matplotlib.pyplot as plt  # for visualization

def save_model(model) -> None:
    filename = "sudokuRecognizer/models/" + datetime.now().strftime("%d.%m.%y-%H:%M:%S") + ".keras"
    model.save(filename)


# Modified National Institute of Standards and Technology database
(x_train, y_train), (x_test, y_test) = mnist.load_data()

# Turn labels into vectors
le = LabelBinarizer()
y_train = le.fit_transform(y_train)
y_test = le.transform(y_test)

# normalizing
x_train = tf.keras.utils.normalize(x_train, axis=1)
x_test = tf.keras.utils.normalize(x_test, axis=1)

# Define model
model = Sequential([
    Flatten(input_shape=(28, 28)),
    Dense(128, activation="relu"),
    Dense(128, activation="relu"),
    Dense(10, activation="softmax")
])

# Compile model
model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])

# Fit model
model.fit(x_train, y_train, validation_data=(x_test, y_test), batch_size=20, epochs=50, verbose=1)  # train model

image = cv.imread("sudokuRecognizer/test.png")
image = cv.cvtColor(image, cv.COLOR_RGB2GRAY)
image = cv.resize(image, (28, 28))
image = image / 255.0  # Normalize the image
image = np.expand_dims(image, axis=0)

prediction = model.predict(image)
print(prediction)

# Predict the class of the new image
predictions = model.predict(image)
predicted_class = np.argmax(predictions, axis=1)

print(predicted_class)

save_model(model)
