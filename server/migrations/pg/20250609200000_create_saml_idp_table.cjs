exports.up = function (knex) {
  return knex.schema.createTable(
    'saml_idp',
    function (table) {
      table.increments('id').primary()
      table.string('name')
        .notNullable()
      table.string('userIdAttribute')
        .notNullable()
      table.string('emailAttribute')
      table.string('firstNameAttribute')
      table.string('lastNameAttribute')
      table.text('metadata')
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
        CREATE UNIQUE INDEX idx_unique_saml_idp_name
        ON "saml_idp" ("name")
        WHERE "deletedAt" IS NULL;
      `)
    })
}

exports.down = function (knex) {
  return knex.schema.dropTable('saml_idp')
}
