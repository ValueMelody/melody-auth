exports.up = function (knex) {
  return knex.schema.createTable(
    'app_scope',
    function (table) {
      table.increments('id').primary()
      table.integer('appId')
        .notNullable()
      table.integer('scopeId')
        .notNullable()
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
      table.foreign('scopeId').references('id')
        .inTable('scope')
      table.foreign('appId').references('id')
        .inTable('app')
    },
  )
    .then(function () {
      return knex.schema.raw(`
        CREATE UNIQUE INDEX idx_unique_app_scope
        ON "app_scope" ("scopeId", "appId")
        WHERE "deletedAt" IS NULL;
      `)
    })
    .then(function () {
      return knex('app_scope').insert([
        {
          appId: 1,
          scopeId: 1,
        },
        {
          appId: 1,
          scopeId: 2,
        },
        {
          appId: 1,
          scopeId: 3,
        },
        {
          appId: 2,
          scopeId: 4,
        },
      ])
    })
}

exports.down = function (knex) {
  return knex.schema.dropTable('app_scope')
}
