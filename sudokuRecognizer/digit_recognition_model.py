""" This module will retrieve image of one square of the sudoku board to one digit """

from dataclasses import dataclass
from PIL import Image 
import easyocr 
import cv2
import numpy as np
import imutils 
from skimage.segmentation import clear_border

digit = int 
image = cv2.imread("test.png")
image = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

def image_to_text(cell: Image, debug=False) -> digit:
    """
    takes the image and converts it to a digit  

    Args
        Image 

    Returns 
        int  
        
    """
    # TODO 
    # Step 1
    # if a digit excist in cell, OCR it  
    #if digit excist
        #extract image 
    
    # apply automatic thresholding to the cell and then clear any
	# connected borders that touch the border of the cell
    thresh = cv2.threshold(cell, 0, 255,
		cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
    thresh = clear_border(thresh)
	# check to see if we are visualizing the cell thresholding step
    if debug:
        cv2.imshow("Cell Thresh", thresh)
        cv2.waitKey(0)
    
    # find contours in the thresholded cell
    cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)

    # if no contours were found than this is an empty cell
    if len(cnts) == 0:  
        return 0
	
    # otherwise, find the largest contour in the cell and create a
	# mask for the contour
    c = max(cnts, key=cv2.contourArea)
    mask = np.zeros(thresh.shape, dtype="uint8")
    cv2.drawContours(mask, [c], -1, 255, -1)

    # compute the percentage of masked pixels relative to the total
	# area of the image
    (h, w) = thresh.shape
    percentFilled = cv2.countNonZero(mask) / float(w * h)

    # if less than 3% of the mask is filled then we are looking at
	# noise and can safely ignore the contour
    if percentFilled < 0.03:
        return 0
    
	# apply the mask to the thresholded cell
    digit = cv2.bitwise_and(thresh, thresh, mask=mask)
	# check to see if we should visualize the masking step

    if debug:
        cv2.imshow("Digit", digit)
        cv2.waitKey(0)

	# return the digit to the calling function
    return digit

    #reader = easyocr.Reader(['en'], gpu=False)
    #digit = reader.readtext(image)

    #if (digit != int): 
    #    digit = 0 

    # Step 2 
    #if digit not excist in cell, return 0  

    
print(image_to_text(image, True))


#extract image 