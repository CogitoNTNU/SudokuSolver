import numpy as np
from keras.datasets import mnist
from sklearn.preprocessing import LabelBinarizer
from sklearn.model_selection import train_test_split
import tensorflowjs as tfjs

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

from keras.models import Sequential
from keras.layers import Dense, Conv2D, Flatten, MaxPooling2D, Dropout

# Define the model
model = Sequential()
model.add(Conv2D(32, kernel_size=(3, 3), activation='relu', input_shape=(28, 28, 1)))
model.add(MaxPooling2D(pool_size=(2, 2)))
model.add(Conv2D(64, (3, 3), activation='relu'))
model.add(MaxPooling2D(pool_size=(2, 2)))
model.add(Flatten())
model.add(Dense(128, activation='relu'))
model.add(Dropout(0.5))
model.add(Dense(9, activation='softmax'))  # 10 classes for the digits 1-9

# Compile the model
model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

# Train the model
history = model.fit(x_train, y_train, validation_split=0.2, epochs=10, batch_size=32)

# Evaluate the model
loss, accuracy = model.evaluate(x_test, y_test)  # You'll need to preprocess x_test and y_test like x_train and y_train
print(f"Test loss: {loss}, Test accuracy: {accuracy}")

model_path = "website/public/models"  # Make sure the path uses forward slashes or raw string literals for Windows paths
tfjs.converters.save_keras_model(model, model_path)