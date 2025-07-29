exports.up = function (knex) {
  return knex.schema
    .createTable(
      'banner',
      function (table) {
        table.increments('id').primary()
        table.string('type', 10)
          .notNullable()
        table.string('text')
        table.text('locales')
        table.smallint('isActive')
          .notNullable()
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
    .createTable(
      'app_banner',
      function (table) {
        table.increments('id').primary()
        table.integer('bannerId').notNullable()
        table.integer('appId').notNullable()
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
        table.foreign('bannerId').references('id').inTable('banner')
        table.foreign('appId').references('id').inTable('app')
      },
    )
}

exports.down = function (knex) {
  return knex.schema.dropTable('app_banner').schema.dropTable('banner')
}
