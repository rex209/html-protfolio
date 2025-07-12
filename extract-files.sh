#!/bin/bash

# Extract files from all-files.txt
INPUT_FILE="${1:-all-files.txt}"

if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Error: $INPUT_FILE not found!"
    echo "Please make sure your all-files.txt is in the same directory as this script."
    exit 1
fi

echo "📁 Extracting files from $INPUT_FILE..."

# Read the file and split by === FILE: marker
awk '
BEGIN { 
    RS = "=== FILE: "
    extracted = 0
}
NR > 1 {
    # Get filename (first line)
    split($0, parts, "\n")
    filename = parts[1]
    
    # Get content (rest of lines)
    content = ""
    for (i = 2; i <= length(parts); i++) {
        content = content parts[i]
        if (i < length(parts)) content = content "\n"
    }
    
    # Create directory if needed
    dir = filename
    gsub(/\/[^\/]*$/, "", dir)
    if (dir != filename && dir != "") {
        system("mkdir -p " dir)
    }
    
    # Write file
    print content > filename
    close(filename)
    
    printf "✅ Extracted: %s\n", filename
    extracted++
}
END {
    printf "\n🎉 Successfully extracted %d files!\n", extracted
    print "\nNext steps:"
    print "1. Install dependencies: npm install"
    print "2. Copy environment file: cp .env.example .env"
    print "3. Edit .env with your actual values"
    print "4. Run demo mode: npm run demo"
    print "5. Or run production: npm start"
}' "$INPUT_FILE"

echo "✨ Extraction complete!"