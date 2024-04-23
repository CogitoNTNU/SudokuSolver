import numpy as np
from keras.models import Sequential
from keras.layers import Dense, Dropout, Flatten
from keras.layers import Conv2D, MaxPooling2D, BatchNormalization
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


# Remove some zeroes
num_zeroes = len(labels[np.where(labels == 0)])
# print(num_zeroes)
for i in range(10):
    print(i, len(labels[np.where(labels == i)]))

target_zeroes = num_zeroes // 11

digits_temp = np.empty((num_images - target_zeroes, 28, 28))
labels_temp = np.empty((num_images - target_zeroes))

zeroes = 0
j = 0
for i in range(num_images):
    if (labels[i] == 0):
        if (zeroes >= target_zeroes):
            continue
        zeroes += 1
    labels_temp[j] = labels[i]
    digits_temp[j] = digits[i]
    j += 1

# Split into train and test
(x_train, y_train), (x_test, y_test) = split_data(digits, labels)

# Turn labels into vectors
le = LabelBinarizer()
y_train = le.fit_transform(y_train)
y_test = le.transform(y_test)

# Define model
model = Sequential()

model.add(Conv2D(filters=32, kernel_size=(3, 3), activation='relu', strides=1, padding='same', data_format='channels_last',
                 input_shape=(28, 28, 1)))
model.add(BatchNormalization())
model.add(Conv2D(filters=32, kernel_size=(3, 3), activation='relu',
          strides=1, padding='same', data_format='channels_last'))
model.add(BatchNormalization())
model.add(MaxPooling2D(pool_size=(2, 2), strides=2, padding='valid'))
model.add(Dropout(0.25))

model.add(Conv2D(filters=64, kernel_size=(3, 3), activation='relu',
          strides=1, padding='same', data_format='channels_last'))
model.add(BatchNormalization())
model.add(Conv2D(filters=64, kernel_size=(3, 3), strides=1,
          padding='same', activation='relu', data_format='channels_last'))
model.add(BatchNormalization())
model.add(MaxPooling2D(pool_size=(2, 2), padding='valid', strides=2))
model.add(Dropout(0.25))

model.add(Flatten())
model.add(Dense(512, activation='relu'))
model.add(BatchNormalization())
model.add(Dropout(0.25))
model.add(Dense(1024, activation='relu'))
model.add(BatchNormalization())
model.add(Dropout(0.5))
model.add(Dense(10, activation='softmax'))

# Compile model
model.compile(optimizer="adam", loss="categorical_crossentropy",
              metrics=["accuracy"])

# Fit model
model.fit(x_train, y_train, validation_data=(x_test, y_test),
          batch_size=20, epochs=50, verbose=1)  # train model


# Save model
tfjs.converters.save_keras_model(model, model_path)
