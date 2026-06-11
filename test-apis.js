const fs = require('fs');
const path = require('path');

async function run() {
  const dbPath = path.join(process.cwd(), 'data', 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  for (const client of db.clients) {
    console.log(`\nTesting client: ${client.id} - ${client.companyName.substring(0, 30)}...`);
    
    try {
      const res = await fetch('http://localhost:3000/api/improve-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          pulsePlan: {
            companyName: client.companyName,
            customerContext: "Test context",
            predictedObjection: "Test objection",
            plannedResponse: "Test response",
            callObjective: "Test objective",
            confidenceLevel: 5
          }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(`improve-pitch FAILED for ${client.id}:`, data);
      } else {
        console.log(`improve-pitch SUCCESS for ${client.id}`);
      }
    } catch (err) {
      console.error(`improve-pitch ERROR for ${client.id}:`, err.message);
    }

    if (client.debriefs && client.debriefs.length > 0) {
      try {
        const res = await fetch('http://localhost:3000/api/generate-improvement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: client.id })
        });
        const data = await res.json();
        if (!res.ok) {
          console.error(`generate-improvement FAILED for ${client.id}:`, data);
        } else {
          console.log(`generate-improvement SUCCESS for ${client.id}`);
        }
      } catch (err) {
        console.error(`generate-improvement ERROR for ${client.id}:`, err.message);
      }
    } else {
      console.log(`Skipping generate-improvement for ${client.id} (no debriefs)`);
    }
  }
}

run();
