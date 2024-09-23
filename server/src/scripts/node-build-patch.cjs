const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../dist/routes/other.js');

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
      console.error('Error reading file:', err);
      return;
  }

  const result = data.replace(
      "import swaggerSpec from '../scripts/swagger.json'",
      "import swaggerSpec from '../scripts/swagger.json' with { type: 'json' }"
  );

  fs.writeFile(filePath, result, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
  })
})
