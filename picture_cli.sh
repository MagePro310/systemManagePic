#!/bin/bash

URL="http://localhost:8000/pictures"

case "$1" in
  get)
    # Usage: ./picture_cli.sh get filename
    if [ -z "$2" ]; then 
      echo "Error: Missing filename"
      echo "Usage: $0 get filename"
      exit 1
    fi
    echo "Downloading $2..."
    curl -s "$URL/$2" --output "$2"
    if [ $? -eq 0 ]; then
      echo "File downloaded successfully: $2"
    else
      echo "Error: Failed to download $2"
    fi
    ;;
  post)
    # Usage: ./picture_cli.sh post [--replace] /path/to/file1.jpg [/path/to/file2.jpg ...]
    REPLACE_FLAG="false"
    
    # Check for --replace flag
    if [ "$2" = "--replace" ]; then
      REPLACE_FLAG="true"
      shift
    fi
    
    if [ -z "$2" ]; then 
      echo "Error: Missing file(s)"
      echo "Usage: $0 post [--replace] /path/to/file1.jpg [/path/to/file2.jpg ...]"
      exit 1
    fi
    shift
    
    FORM_ARGS=()
    for file in "$@"; do
      if [ ! -f "$file" ]; then
        echo "Error: File not found: $file"
        exit 1
      fi
      FORM_ARGS+=(-F "files=@$file")
    done
    
    # Add replace flag
    FORM_ARGS+=(-F "replace=$REPLACE_FLAG")
    
    echo "Uploading files... (Replace: $REPLACE_FLAG)"
    curl "${FORM_ARGS[@]}" "$URL"
    echo
    ;;
  put)
    # Usage: ./picture_cli.sh put filename /path/to/newfile.jpg
    if [ -z "$2" ] || [ -z "$3" ]; then 
      echo "Error: Missing arguments"
      echo "Usage: $0 put filename /path/to/newfile.jpg"
      exit 1
    fi
    if [ ! -f "$3" ]; then
      echo "Error: File not found: $3"
      exit 1
    fi
    echo "Updating $2..."
    curl -X PUT -F "file=@$3" "$URL/$2"
    echo
    ;;
  delete)
    # Usage: ./picture_cli.sh delete filename
    if [ -z "$2" ]; then 
      echo "Error: Missing filename"
      echo "Usage: $0 delete filename"
      exit 1
    fi
    echo "Deleting $2..."
    curl -X DELETE -H "Content-Type: application/json" -d "[\"$2\"]" "$URL"
    echo
    ;;
  list)
    # Usage: ./picture_cli.sh list
    echo "Listing all pictures..."
    curl -s "$URL" | python3 -m json.tool
    ;;
  *)
    echo "Picture Management CLI"
    echo "Usage:"
    echo "  $0 get filename                                    - Download a picture"
    echo "  $0 post [--replace] /path/to/file1.jpg [file2...] - Upload picture(s)"
    echo "  $0 put filename /path/to/newfile.jpg               - Update a picture"
    echo "  $0 delete filename                                 - Delete a picture"
    echo "  $0 list                                            - List all pictures"
    echo ""
    echo "Options:"
    echo "  --replace   Replace existing files instead of creating new ones"
    ;;
esac