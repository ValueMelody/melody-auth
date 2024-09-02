exports.up = function (knex) {
  return knex.schema.createTable(
    'user_role',
    function (table) {
      table.increments('id').primary()
      table.integer('userId')
        .notNullable()
      table.integer('roleId')
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
      table.foreign('userId').references('id')
        .inTable('user')
      table.foreign('roleId').references('id')
        .inTable('role')
    },
  )
    .then(function () {
      return knex.schema.raw(`
        CREATE UNIQUE INDEX idx_unique_user_role
        ON "user_role" ("userId", "roleId")
        WHERE "deletedAt" IS NULL;
      `)
    })
}

exports.down = function (knex) {
  return knex.schema.dropTable('user_role')
}
