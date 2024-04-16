from cv2.typing import MatLike
import tensorflow as tf
from tensorflow.keras import Model
import numpy as np


class NumberRecognizer:

    model: Model

    def load(self, filename):
        self.model = tf.keras.models.load_model(filename)
        self.model.steps_per_execution = 1  # Quick fix

    def image_to_num(self, image: MatLike) -> int:
        predictions = self.model.predict(image)
        return np.argmax(predictions, axis=1)[0]
