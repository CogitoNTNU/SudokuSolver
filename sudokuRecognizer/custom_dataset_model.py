import numpy as np
from keras.models import Sequential
from keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from keras.optimizers import Adam
from keras.losses import CategoricalCrossentropy
from keras.metrics import Accuracy
from sklearn.preprocessing import LabelBinarizer
import tensorflowjs as tfjs

label_path = "../website/prisma/seeding/labels.bin"
digits_path = "../website/prisma/seeding/digits.bin"
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

for i in range(10):
    print(i, len(y_test[np.where(y_test == i)]))

# # Turn labels into vectors
le = LabelBinarizer()
y_train = le.fit_transform(y_train)
y_test = le.transform(y_test)

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

NUM_OUTPUT_CLASSES = 9  # Change this back to 10 if you're recognizing digits 0-9
model.add(Dense(units=NUM_OUTPUT_CLASSES, activation='softmax',
                kernel_initializer='glorot_uniform'))

optimizer = Adam()
model.compile(optimizer=optimizer,
                loss=CategoricalCrossentropy(),
                metrics=[Accuracy()])

# Compile model
model.compile(optimizer="adam", loss="categorical_crossentropy",
              metrics=["accuracy"])

# Fit model
model.fit(x_train, y_train, validation_data=(x_test, y_test),
          batch_size=64, epochs=20, shuffle=True, verbose=1)  # train model


# Save model
tfjs.converters.save_keras_model(model, model_path)
