import numpy as np
import tensorflowjs as tfjs
from keras.datasets import mnist
from sklearn.preprocessing import LabelBinarizer
from sklearn.model_selection import train_test_split
from keras.models import Sequential
from keras.layers import Conv2D, MaxPooling2D, Flatten, Dense
from keras.optimizers import Adam
from keras.losses import CategoricalCrossentropy
from keras.metrics import Accuracy

label_path = "website/prisma/seeding/labels.bin"
digits_path = "website/prisma/seeding/digits.bin"

# Read labels and digits
labels = np.fromfile(label_path, dtype=np.uint8)
digit_buffer = np.fromfile(digits_path, dtype=np.uint8)
num_images = len(labels)
digits = digit_buffer.reshape((num_images, 28, 28))

# Remove all zeroes from the custom dataset
non_zero_mask = labels != 0
custom_labels = labels[non_zero_mask]
custom_digits = digits[non_zero_mask]

# Load MNIST dataset
(x_mnist, y_mnist), (x_test_mnist, y_test_mnist) = mnist.load_data()

# Filter out zeroes from MNIST dataset
non_zero_mask_mnist = y_mnist != 0
mnist_digits = x_mnist[non_zero_mask_mnist]
mnist_labels = y_mnist[non_zero_mask_mnist]

# Combine custom dataset with MNIST dataset
x_combined = np.concatenate((custom_digits, mnist_digits))
y_combined = np.concatenate((custom_labels, mnist_labels))

# Shuffle combined dataset
shuffle_indices = np.random.permutation(len(y_combined))
x_combined = x_combined[shuffle_indices]
y_combined = y_combined[shuffle_indices]

# Split into train and test sets
x_train, x_test, y_train, y_test = train_test_split(x_combined, y_combined, test_size=0.2, random_state=42)

# Normalize and reshape
x_train = x_train / 255.0
x_train = x_train.reshape(x_train.shape[0], 28, 28, 1)
x_test = x_test / 255.0
x_test = x_test.reshape(x_test.shape[0], 28, 28, 1)

# Turn labels into vectors
le = LabelBinarizer()
y_train = le.fit_transform(y_train)
y_test = le.transform(y_test)

print("Train set shapes:", x_train.shape, y_train.shape)
print("Test set shapes:", x_test.shape, y_test.shape)


# Define the model
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


tfjs.converters.save_keras_model(model, "model")
