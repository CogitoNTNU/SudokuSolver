import numpy as np

size = 28*28

with open("website/prisma/seeding/labels.bin", "rb") as label_file:
    label_blob = label_file.read()

labels = np.frombuffer(label_blob, dtype=np.uint8).copy()

with open("website/prisma/seeding/digits.bin", "rb") as digits_file:
    digits_blob = digits_file.read()
    data = np.frombuffer(digits_blob, dtype=np.uint8)

    for i in range(len(labels)):
        img = data[i*size:(i+1)*size]
        if np.mean(img) < 10:
            labels[i] = 0
    
with open("website/prisma/seeding/labels.bin", "wb") as label_file:
    label_file.write(labels.tobytes())

print("Zeroes labelled successfully")