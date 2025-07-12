const fs = require('fs');
const path = require('path');

// Read the all-files.txt content
function extractFiles(inputFile = 'all-files.txt') {
    try {
        if (!fs.existsSync(inputFile)) {
            console.error(`❌ Error: ${inputFile} not found!`);
            console.log('Please make sure your all-files.txt is in the same directory as this script.');
            process.exit(1);
        }

        const content = fs.readFileSync(inputFile, 'utf8');
        
        // Split by file separators
        const sections = content.split('=== FILE: ');
        
        let extractedCount = 0;
        
        sections.forEach((section, index) => {
            if (index === 0) return; // Skip first empty section
            
            // Extract filename and content
            const lines = section.split('\n');
            const filename = lines[0].trim();
            const fileContent = lines.slice(1).join('\n');
            
            // Create directory if it doesn't exist
            const dirname = path.dirname(filename);
            if (dirname && dirname !== '.') {
                fs.mkdirSync(dirname, { recursive: true });
            }
            
            // Write the file
            fs.writeFileSync(filename, fileContent);
            console.log(`✅ Extracted: ${filename}`);
            extractedCount++;
        });
        
        console.log(`\n🎉 Successfully extracted ${extractedCount} files!`);
        console.log('\nNext steps:');
        console.log('1. Install dependencies: npm install');
        console.log('2. Copy environment file: cp .env.example .env');
        console.log('3. Edit .env with your actual values');
        console.log('4. Run demo mode: npm run demo');
        console.log('5. Or run production: npm start');
        
    } catch (error) {
        console.error('❌ Error extracting files:', error.message);
        process.exit(1);
    }
}

// Handle command line arguments
const inputFile = process.argv[2] || 'all-files.txt';
extractFiles(inputFile);