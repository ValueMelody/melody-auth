exports.up = function (knex) {
  return knex.schema.createTable(
    'scope_locale',
    function (table) {
      table.increments('id').primary()
      table.integer('scopeId')
        .notNullable()
      table.string(
        'locale',
        5,
      )
        .notNullable()
      table.string('value')
        .notNullable()
        .defaultTo('')
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
    },
  )
    .then(function () {
      return knex.schema.raw(`
        CREATE UNIQUE INDEX idx_unique_scope_locale
        ON "scope_locale" ("scopeId", "locale")
        WHERE "deletedAt" IS NULL;
      `)
    })
    .then(function () {
      return knex('scope_locale').insert([
        {
          scopeId: 2,
          locale: 'en',
          value: 'Access your basic profile information',
        },
        {
          scopeId: 2,
          locale: 'fr',
          value: 'Accéder à vos informations de profil de base',
        },
      ])
    })
}

exports.down = function (knex) {
  return knex.schema.dropTable('scope_locale')
}
