import numpy as np
from keras.models import Sequential
from keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from keras.optimizers import Adam
from keras.losses import CategoricalCrossentropy
from keras.metrics import Accuracy
from sklearn.preprocessing import LabelBinarizer
import tensorflowjs as tfjs

label_path = "website/prisma/seeding/labels.bin"
digits_path = "website/prisma/seeding/digits.bin"
model_path = "new_model"


def split_data(x: np.ndarray, y: np.ndarray) -> tuple[tuple[np.ndarray, np.ndarray], tuple[np.ndarray, np.ndarray]]:
    i = int(len(y) * 0.8)
    return (x[:i], y[:i]), (x[i:], y[i:])


# Read labels
labels: np.ndarray
with open(label_path, "rb") as f:
    labels = np.frombuffer(f.read(), dtype=np.uint8)

# Read digits
digits: np.ndarray
size = 28*28
with open(digits_path, "rb") as f:
    digit_buffer = np.frombuffer(f.read(), dtype=np.uint8)

    num_images = len(labels)
    digits = np.empty((num_images, 28, 28))

    for n in range(num_images):
        img = digit_buffer[n*size:(n+1)*size]
        img = img.reshape((28, 28))
        digits[n] = img



# for i in range(10):
#     print(i, len(labels[np.where(labels == i)]))

# Remove all zeroes
zero_mask = np.where(labels != 0)
labels = labels[zero_mask]
digits = digits[zero_mask]


# Split into train and test
(x_train, y_train), (x_test, y_test) = split_data(digits, labels)

x_train = x_train.astype(np.float32) / 255.0
x_test = x_test.astype(np.float32) / 255.0


# # Turn labels into vectors
le = LabelBinarizer()
y_train = le.fit_transform(y_train)
y_test = le.transform(y_test)

x_train = np.expand_dims(x_train, axis=-1)  # Add an extra dimension for the channels
x_test = np.expand_dims(x_test, axis=-1)

# Define model
model = Sequential()
    
IMAGE_WIDTH = 28
IMAGE_HEIGHT = 28
IMAGE_CHANNELS = 1

model.add(Conv2D(filters=8, kernel_size=5, strides=1, activation='relu', 
                    kernel_initializer='glorot_uniform', 
                    input_shape=(IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS)))

model.add(MaxPooling2D(pool_size=(2, 2), strides=(2, 2)))

model.add(Conv2D(filters=16, kernel_size=5, strides=1, activation='relu', 
                    kernel_initializer='glorot_uniform'))

model.add(MaxPooling2D(pool_size=(2, 2), strides=(2, 2)))

model.add(Flatten())

model.add(Dense(units=9, activation='softmax',
                kernel_initializer='glorot_uniform'))

model.compile(optimizer=Adam(),
                loss=CategoricalCrossentropy(),
                metrics=[Accuracy()])

model.compile(optimizer="adam", loss="categorical_crossentropy",
              metrics=["accuracy"])

model.fit(x_train, y_train, validation_data=(x_train, y_train),
          batch_size=64, epochs=8, shuffle=True, verbose=1)


tfjs.converters.save_keras_model(model, model_path)
