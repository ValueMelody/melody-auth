exports.up = async function (knex) {
  return knex.schema.table(
    'org',
    function (table) {
      table.string(
        'slug',
        50,
      ).notNullable()
        .defaultTo('')
    },
  )
    .then(function () {
      return knex.schema.raw(`
      CREATE UNIQUE INDEX idx_unique_org_slug
      ON "org" ("slug")
      WHERE "deletedAt" IS NULL;
    `)
    })
}

exports.down = async function (knex) {
  return knex.schema.table(
    'org',
    function (table) {
      table.dropColumn('slug')
    },
  )
}
