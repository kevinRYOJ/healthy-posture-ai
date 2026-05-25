const path = require('path');
const { execFile } = require('child_process');

const pythonExecutable = path.join(__dirname, '../../venv/Scripts/python.exe');
const scriptPath = path.join(__dirname, 'predict.py');
const scaledArray = [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]; // Dummy data

execFile(pythonExecutable, [scriptPath, JSON.stringify(scaledArray)], (error, stdout, stderr) => {
    console.log("Error:", error);
    console.log("Stdout:", stdout);
    console.log("Stderr:", stderr);
    
    try {
        const jsonStart = stdout.indexOf('{');
        const jsonEnd = stdout.lastIndexOf('}') + 1;
        
        if (jsonStart === -1) throw new Error("No JSON found in stdout");
        
        const jsonString = stdout.substring(jsonStart, jsonEnd);
        console.log("Extracted JSON:", jsonString);
        
        const result = JSON.parse(jsonString);
        console.log("Result:", result);
    } catch(e) {
        console.error("Parse error:", e);
    }
});
