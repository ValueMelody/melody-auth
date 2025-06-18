exports.up = function (knex) {
  return knex.schema.createTable(
    'org_group',
    function (table) {
      table.increments('id').primary()
      table.string(
        'name',
        50,
      ).notNullable()
      table.integer('orgId').notNullable()
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
      table.foreign('orgId').references('id')
        .inTable('org')
    },
  )
    .then(function () {
      return knex.schema.raw(`
        CREATE UNIQUE INDEX idx_unique_org_group_name
        ON "org_group" ("name", "orgId")
        WHERE "deletedAt" IS NULL;
      `)
    })
}

exports.down = function (knex) {
  return knex.schema.dropTable('org_group')
}
