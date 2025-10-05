#!/usr/bin/env node

const https = require('https');

const options = {
  hostname: 'teddykids.app.n8n.cloud',
  path: '/api/v1/workflows',
  method: 'GET',
  headers: {
    'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYzM1MjE2Yy1mNzJjLTQ2MWItYTU5OC0xZDVmMmQ5ZGI3OGEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5NjM3NTM5fQ.rYjraQHRS2j8st2v5vt0myardtXOIVat5D6az0JfCkk',
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const workflows = JSON.parse(data);
      console.log('\n=== Your n8n Workflows ===\n');
      
      if (workflows.data && Array.isArray(workflows.data)) {
        workflows.data.forEach((workflow, index) => {
          console.log(`${index + 1}. ${workflow.name}`);
          console.log(`   ID: ${workflow.id}`);
          console.log(`   Active: ${workflow.active ? '✅' : '❌'}`);
          console.log(`   Nodes: ${workflow.nodes?.length || 0}`);
          console.log('');
        });
        console.log(`Total workflows: ${workflows.data.length}\n`);
      } else {
        console.log(JSON.stringify(workflows, null, 2));
      }
    } catch (e) {
      console.error('Error parsing response:', e.message);
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();

