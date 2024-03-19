import certifi
import ssl
ssl_context = ssl.create_default_context(cafile=certifi.where())

import os #interacting w the os 
import cv2 as cv #computer vision to load and process images 
import numpy as np  #for numpy arrays 
import matplotlib.pyplot as plt  #for visualization
import tensorflow as tf #ML part 

import SudokuSolver.digit_recognition_model



mnist = tf.keras.datasets.mnist #Modified National Institute of Standards and Technology database
(x_train, y_train), (x_test, y_test) = mnist.load_data()

#normalizing

x_train = tf.keras.utils.normalize(x_train, axis=1)
x_test = tf.keras.utils.normalize(x_test, axis=1)


model = tf.keras.models.Sequential()
model.add(tf.keras.layers.Flatten(input_shape=(28, 28)))
model.add(tf.keras.layer.Dense(128, activation="relu")) #basic NN, activation 
model.add(tf.keras.layer.Dense(128, activation="relu"))
model.add(tf.keras.layer.Dense(10, activation="softmax")) #represent each digit 

model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics = ["accurancy"])

model.fit(x_train, y_train) #train model 

#https://pyimagesearch.com/2020/08/10/opencv-sudoku-solver-and-ocr/