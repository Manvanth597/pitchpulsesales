const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

let initialCount = data.clients.length;
let removedCount = 0;

data.clients = data.clients.filter(client => {
  if (client.objectionHistory && Array.isArray(client.objectionHistory)) {
    const hasDuplicates = new Set(client.objectionHistory).size !== client.objectionHistory.length;
    if (hasDuplicates) {
      removedCount++;
      return false; // Remove this client
    }
  }
  return true; // Keep this client
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`Cleaned up database. Initial clients: ${initialCount}, Removed: ${removedCount}, Remaining: ${data.clients.length}`);
