exports.up = function (knex) {
  return knex.schema.createTable(
    'user_attribute_value',
    function (table) {
      table.increments('id').primary()
      table.integer('userId')
        .notNullable()
      table.integer('userAttributeId')
        .notNullable()
      table.string('value')
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
      table.foreign('userId').references('id')
        .inTable('user')
      table.foreign('userAttributeId').references('id')
        .inTable('user_attribute')
    },
  )
    .then(function () {
      return knex.schema.raw(`
        CREATE UNIQUE INDEX idx_unique_user_attribute_value
        ON "user_attribute_value" ("userId", "userAttributeId")
        WHERE "deletedAt" IS NULL;
      `)
    })
}

exports.down = function (knex) {
  return knex.schema.dropTable('user_attribute_value')
}
