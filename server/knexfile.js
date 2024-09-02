const dotenv = require('dotenv')
dotenv.config({ path: '.dev.vars' })

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  client: 'pg',
  connection: process.env.PG_CONNECTION_STRING,
  migrations: { directory: './migrations/pg' },
}
