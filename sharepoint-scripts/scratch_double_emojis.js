const fs = require('fs');

const filePath = 'projects/surgiflow/Create-ConsolidatedColumns.js';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /"DisplayName":\s*"([^\w\s\d\-_&/\\()\[\]',.:;]+)\s+(.*?)\s+([^\w\s\d\-_&/\\()\[\]',.:;]+)"/g;

content = content.replace(regex, (match, p1, p2, p3) => {
    const chars1 = Array.from(p1);
    const chars3 = Array.from(p3);
    
    let newP1 = p1;
    let newP3 = p3;
    
    if (chars1.length === 1) {
        newP1 = chars1[0] + chars1[0];
    } else if (chars1.length === 2 && chars1[0] !== chars1[1]) {
        newP1 = p1 + p1;
    } else if (chars1.length > 2) {
        const mid = Math.floor(chars1.length / 2);
        const firstHalf = chars1.slice(0, mid).join('');
        const secondHalf = chars1.slice(mid).join('');
        if (firstHalf !== secondHalf) {
            newP1 = p1 + p1;
        }
    }
    
    if (chars3.length === 1) {
        newP3 = chars3[0] + chars3[0];
    } else if (chars3.length === 2 && chars3[0] !== chars3[1]) {
        newP3 = p3 + p3;
    } else if (chars3.length > 2) {
        const mid = Math.floor(chars3.length / 2);
        const firstHalf = chars3.slice(0, mid).join('');
        const secondHalf = chars3.slice(mid).join('');
        if (firstHalf !== secondHalf) {
            newP3 = p3 + p3;
        }
    }
    
    return `"DisplayName": "${newP1} ${p2} ${newP3}"`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully doubled emojis in Create-ConsolidatedColumns.js');
