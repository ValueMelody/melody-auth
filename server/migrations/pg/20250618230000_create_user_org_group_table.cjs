exports.up = function (knex) {
  return knex.schema.createTable(
    'user_org_group',
    function (table) {
      table.increments('id').primary()
      table.integer('userId')
        .notNullable()
      table.integer('orgGroupId')
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
      table.foreign('orgGroupId').references('id')
        .inTable('org_group')
    },
  )
    .then(function () {
      return knex.schema.raw(`
        CREATE UNIQUE INDEX idx_unique_user_org_group
        ON "user_org_group" ("userId", "orgGroupId")
        WHERE "deletedAt" IS NULL;
      `)
    })
}

exports.down = function (knex) {
  return knex.schema.dropTable('user_org_group')
}
