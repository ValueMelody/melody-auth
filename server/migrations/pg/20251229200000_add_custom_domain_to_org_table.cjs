exports.up = async function (knex) {
  return knex.schema.table(
    'org',
    function (table) {
      table.string(
        'customDomain',
        255,
      )
        .defaultTo(null)
      table.integer('customDomainVerified')
        .defaultTo(0)
      table.string(
        'customDomainVerificationToken',
        100,
      )
        .defaultTo(null)
    },
  )
    .then(function () {
      return knex.schema.raw(`
        CREATE UNIQUE INDEX idx_org_custom_domain
        ON "org" ("customDomain")
        WHERE "customDomain" IS NOT NULL AND "deletedAt" IS NULL;
      `)
    })
}

exports.down = async function (knex) {
  return knex.schema.raw('DROP INDEX IF EXISTS idx_org_custom_domain')
    .then(function () {
      return knex.schema.table(
        'org',
        function (table) {
          table.dropColumn('customDomain')
          table.dropColumn('customDomainVerified')
          table.dropColumn('customDomainVerificationToken')
        },
      )
    })
}
