
# FastAPI Image Upload Example

This is a simple FastAPI application that allows you to upload images. The uploaded images are saved in a specified directory.

## 0 run main

## Run the FastAPI application

uvicorn main:app --reload

## 1. Upload a picture

## Upload single file

./picture_cli.sh post /home/trieu/D/tsv.jpg

## Upload multiple files

./picture_cli.sh post /home/trieu/D/tsv.jpg /home/trieu/D/photo2.jpg /home/trieu/D/image3.png

## 2. List all pictures to verify upload

./picture_cli.sh list

## 3. Download the picture to verify

./picture_cli.sh get tsv.jpg

## 4. Update/Replace the picture with a new version

./picture_cli.sh put tsv.jpg /home/trieu/D/new_tsv.jpg

## 5. Delete the picture when done

./picture_cli.sh delete tsv.jpg

## 6. Show help message

./picture_cli.sh
