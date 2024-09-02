exports.up = function (knex) {
  return knex.schema.createTable(
    'app',
    function (table) {
      table.increments('id').primary()
      table.string(
        'name',
        50,
      ).notNullable()
      table.string(
        'type',
        3,
      ).notNullable()
      table.string(
        'clientId',
        32,
      ).notNullable()
        .defaultTo(knex.raw('md5(random()::text)'))
      table.string(
        'secret',
        64,
      ).notNullable()
        .defaultTo(knex.raw('concat(md5(random()::text), md5(random()::text))'))
      table.text('redirectUris').notNullable()
        .defaultTo('')
      table.smallint('isActive').notNullable()
        .defaultTo(1)
      table.string(
        'createdAt',
        19,
      ).notNullable()
        .defaultTo(knex.raw("to_char(current_timestamp, 'YYYY-MM-DD HH24:MI:SS')"))
      table.string(
        'updatedAt',
        19,
      ).notNullable()
        .defaultTo(knex.raw("to_char(current_timestamp, 'YYYY-MM-DD HH24:MI:SS')"))
      table.string(
        'deletedAt',
        19,
      ).defaultTo(null)
    },
  )
    .then(function () {
      return knex.schema.raw(`
        CREATE UNIQUE INDEX idx_unique_app_clientId
        ON "app" ("clientId")
        WHERE "deletedAt" IS NULL;
      `)
    })
    .then(function () {
      return knex('app').insert([
        {
          name: 'Admin Panel (SPA)',
          type: 'spa',
          redirectUris: 'http://localhost:3000/en/dashboard,http://localhost:3000/fr/dashboard',
        },
        {
          name: 'Admin Panel (S2S)',
          type: 's2s',
          redirectUris: '',
        },
      ])
    })
}

exports.down = function (knex) {
  return knex.schema.dropTable('app')
}
