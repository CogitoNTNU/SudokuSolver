import numpy as np
from keras.datasets import mnist
from sklearn.preprocessing import LabelBinarizer

label_path = "labels.bin"
digits_path = "digits.bin"

# Read labels and digits
labels = np.fromfile(label_path, dtype=np.uint8)
digit_buffer = np.fromfile(digits_path, dtype=np.uint8)
num_images = len(labels)
digits = digit_buffer.reshape((num_images, 28, 28))

# Remove all zeroes from custom dataset
non_zero_mask = labels != 0
labels = labels[non_zero_mask]
digits = digits[non_zero_mask]

# Load MNIST dataset
(x_train_mnist, y_train_mnist), (_, _) = mnist.load_data()

# Filter out zeroes from MNIST dataset
non_zero_mask_mnist = y_train_mnist != 0
x_train_mnist = x_train_mnist[non_zero_mask_mnist]
y_train_mnist = y_train_mnist[non_zero_mask_mnist]

# Calculate number of MNIST images to use
num_mnist_images = int(len(labels) * 0.3)  # 30% of the number of custom dataset images

# Randomly select MNIST images
mnist_indices = np.random.choice(len(y_train_mnist), num_mnist_images, replace=False)
x_train_mnist_selected = x_train_mnist[mnist_indices]
y_train_mnist_selected = y_train_mnist[mnist_indices]

# Concatenate custom dataset with selected MNIST images
x_train = np.concatenate((digits, x_train_mnist_selected))
y_train = np.concatenate((labels, y_train_mnist_selected))

# Shuffle dataset
shuffle_indices = np.random.permutation(len(y_train))
x_train = x_train[shuffle_indices]
y_train = y_train[shuffle_indices]

# Turn labels into vectors
le = LabelBinarizer()
y_train = le.fit_transform(y_train)


# Normalize
x_train = x_train / 255.0

#Reshape to fit model
x_train = x_train.reshape(x_train.shape[0], 28, 28, 1)


print("x_train shape:", x_train.shape)
print("y_train shape:", y_train.shape)
