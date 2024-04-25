import tensorflow as tf  # ML part
from keras.models import Sequential
from keras.layers import Conv2D, Flatten, Dense
from keras.datasets import mnist
from sklearn.preprocessing import LabelBinarizer
from datetime import datetime


def save_model(model) -> None:
    filename = "sudokuRecognizer/models/" + \
        datetime.now().strftime("%d.%m.%y-%H:%M:%S") + ".keras"
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
    Conv2D(40, (3, 3), activation="relu"),
    Conv2D(80, (3, 3), activation="relu"),
    Conv2D(500, (3, 3), activation="relu"),
    Conv2D(1000, (3, 3), activation="relu"),
    Conv2D(2000, (3, 3), activation="relu"),
    Dense(10, activation="softmax")
])

# Compile model
model.compile(optimizer="adam", loss="categorical_crossentropy",
              metrics=["accuracy"])

# Fit model
model.fit(x_train, y_train, validation_data=(x_test, y_test),
          batch_size=20, epochs=50, verbose=1)  # train model

save_model(model)
