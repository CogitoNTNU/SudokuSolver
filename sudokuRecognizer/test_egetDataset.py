import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt

def generate_white_noise_image(height, width):
    # Create an image with random values [0, 255) and scale to [0, 1)
    arr = np.random.randint(0, 255, (height, width), dtype=np.uint8) / 255.0
    # Set 400 random pixels to 0 (black)
    for i in range(900):
        arr[np.random.randint(0, height), np.random.randint(0, width)] = 0
    return arr  # Return the modified array

# Load the MNIST dataset
mnist = tf.keras.datasets.mnist
(x_train, y_train), (x_test, y_test) = mnist.load_data()

# Ensure images are float32, to be compatible with the noise images
x_train = x_train.astype(np.float32) / 255.0
x_test = x_test.astype(np.float32) / 255.0

# Replace images labeled 0 with white noise images
x_train_modified = np.array([generate_white_noise_image(28, 28) if label == 0 else img for img, label in zip(x_train, y_train)])
x_test_modified = np.array([generate_white_noise_image(28, 28) if label == 0 else img for img, label in zip(x_test, y_test)])

# Function to display a grid of images
def display_images(images, num_rows=2, num_cols=5):
    plt.figure(figsize=(10, 4))
    for i in range(num_rows * num_cols):
        plt.subplot(num_rows, num_cols, i + 1)
        plt.xticks([])
        plt.yticks([])
        plt.grid(False)
        plt.imshow(images[i], cmap='gray')  # Use 'gray' colormap to display grayscale images
    plt.show()

# Display some of the modified images
display_images(x_train_modified[:10])
