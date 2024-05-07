# SudokuSolver
The project is hosted <a href="https://sudoku-solver-sudokusolver.vercel.app">here</a>

---
<!--  <img src="https://github.com/CogitoNTNU/SudokuSolver/assets/72311591/d5fad2ae-193a-4558-9479-a4bf0450d4b6" width="50px" alt="SudokuSolverLogo"> -->

<div align="center">

  
  ![GitHub top language](https://img.shields.io/github/languages/top/CogitoNTNU/SudokuSolver)
  ![GitHub language count](https://img.shields.io/github/languages/count/CogitoNTNU/SudokuSolver)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Project Version](https://img.shields.io/badge/version-1.0.0-blue)](https://img.shields.io/badge/version-1.0.0-blue)

  <div>
    <video src="https://github.com/CogitoNTNU/SudokuSolver/assets/72311591/0e446a5f-589d-4bd2-b484-dc621c3ed974.mp4" controls"></video>
  </div>

</div>

## How to run and install locally
Navigate to the website folder.  
Have node installed and download the dependencies:
```bash
npm i
```
start the website:
```bash
npm run dev
```
Note: The flag --experimental-https is used in dev. This is because safari does not give camera access over http.

## Description
This project is an AR sudoku solving application. Making an application like this consists mainly of solving 4 different problems:

- Finding the position of a sudoku in an image
- Predicting the digits already present in the sudoku
- Solving the sudoku
- Displaying the solution

### Finding the position of a sudoku
The first step of finding the sudoku is to apply a gaussian blur and an adaptive threshold filter. This is done to enhance edges in the image.

<img width="50%" alt="Screenshot 2024-04-28 at 10 52 34" src="https://github.com/CogitoNTNU/SudokuSolver/assets/72311591/76ee04d9-4884-4385-a770-38fee66d9d69">  

OpenCV.js is then used to find contours, and the largest contour with the shape of a rectangle is assumed to be the sudoku. Once a sudoku has been found, it is projected into a square for further processing.

<img width="30%" alt="Screenshot 2024-04-28 at 10 52 45" src="https://github.com/CogitoNTNU/SudokuSolver/assets/72311591/566298f3-cb06-4042-a600-81ae0bcb0653">

### Predicting the digits already present
To predict the digits, the sudoku is split up into 81 small squares, one for each cell in the sudoku. The background of the cells are removed by setting the pixel values that are under the mean to 0, and empty cells are filtered out by looking at the average pixel value in the cells. The lines used to seperate the cells in the sudoku are removed by clearing the borders of each cell. When removing the background, parts of the digits are also removed, which makes them thinner. Therefore, a dilation kernel is used to increase the thickness of the digits. The result looks something like this:

<img width="255" alt="Screenshot 2024-04-28 at 10 53 02" src="https://github.com/CogitoNTNU/SudokuSolver/assets/72311591/a7bbf766-6daa-4709-b448-e5449435e3b3">

Once the digits have been processed, they are sent to a CNN trained with a custom dataset containing 4500 digits. All digits in the dataset were processed using the above-mentioned method. 

### Solving the sudoku
To solve the sudoku, a recursive backtracking algorithm is used. For most practical scenarios this is fast enough, but sudokus can be designed to be resistant against brute force algorithms like this.

### Displaying the solution
When a solution is found, it is drawn on a square. A projection matrix is then calculated to project the solution back into the original position in the live camera feed.

<img width="30%" alt="Screenshot 2024-05-05 at 15 39 50" src="https://github.com/CogitoNTNU/SudokuSolver/assets/72311591/d91df265-2331-445c-8d28-49148b4a7a28">
