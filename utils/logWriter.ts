import fs from 'fs';
import path from 'path';

const logPath = path.join(__dirname, '../logs/miftah-users-log.json');

export function writeLog(testCase: any) {
    const file = JSON.parse(fs.readFileSync(logPath, 'utf-8'));

    file.testCases.push(testCase);

    fs.writeFileSync(logPath, JSON.stringify(file, null, 2));
}
