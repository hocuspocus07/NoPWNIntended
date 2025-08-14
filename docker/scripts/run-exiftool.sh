#!/bin/bash

FILE_PATH="$1"
OUTPUT_FORMAT="$2"
GROUP_NAMES="$3"
BINARY_OUTPUT="$4"
SHOW_ALL_TAGS="$5"
SHOW_COMMON_TAGS="$6"
SPECIFIC_TAGS="$7"
GEOTAGS_ONLY="$8"
REMOVE_METADATA="$9"

ARGS=("-q" "-fast")

if [ "$OUTPUT_FORMAT" = "json" ]; then
    ARGS+=("-json")
elif [ "$OUTPUT_FORMAT" = "csv" ]; then
    CSV_FILE="/tmp/exiftool_$(basename "$FILE_PATH")_$(date +%s).csv"
    ARGS+=("-csv")
elif [ "$OUTPUT_FORMAT" = "xml" ]; then
    ARGS+=("-xml")
fi

if [ "$GROUP_NAMES" = "true" ]; then
    ARGS+=("-g")
fi

if [ "$BINARY_OUTPUT" = "true" ]; then
    ARGS+=("-b")
fi

if [ "$SHOW_ALL_TAGS" = "true" ]; then
    ARGS+=("-a")
fi

if [ -n "$SPECIFIC_TAGS" ]; then
    IFS=',' read -ra TAGS <<< "$SPECIFIC_TAGS"
    for tag in "${TAGS[@]}"; do
        ARGS+=("-$tag")
    done
fi

if [ "$GEOTAGS_ONLY" = "true" ]; then
    ARGS+=("-geotags")
fi

if [ "$REMOVE_METADATA" = "true" ]; then
    CLEANED_FILE="/tmp/cleaned_$(basename "$FILE_PATH")"
    cp "$FILE_PATH" "$CLEANED_FILE"
    exiftool -all= -overwrite_original "$CLEANED_FILE"
    echo "CLEANED_FILE:$CLEANED_FILE"
    echo "Metadata removed successfully"
else
    ARGS+=("$FILE_PATH")
    
    if [ "$OUTPUT_FORMAT" = "csv" ]; then
        exiftool "${ARGS[@]}" > "$CSV_FILE" 2>&1
        
        if [ -f "$CSV_FILE" ] && [ -s "$CSV_FILE" ]; then
            echo "CSV_FILE:$CSV_FILE"
            echo "ExifTool CSV analysis completed successfully"
        else
            echo "Error: Failed to generate CSV output"
            exit 1
        fi
    else
        # For other formats, output directly
        exiftool "${ARGS[@]}"
    fi
fi

if [ "$OUTPUT_FORMAT" = "csv" ] && [ -f "$CSV_FILE" ]; then
    echo "CSV_FILE:$CSV_FILE"
fi
