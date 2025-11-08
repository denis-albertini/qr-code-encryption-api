import '@dotenvx/dotenvx/config';
import database from './database.js';
import app from './express/app.js';

await database.initConnection();
await database.sync({ alter: true });

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));
