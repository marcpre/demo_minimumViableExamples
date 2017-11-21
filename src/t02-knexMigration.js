require('dotenv').config()
// Loading from an external file

// ###########db.js

const config = require('../knexfile')

console.log(config)
const env = process.env.DB_ENV
console.log(env)

const knex = require('knex')(config[env])

knex.on('query', (queryData) => {
  console.log(queryData)
})

// ###########buckets.js

const buckets = function(options) {
  return _.extend({
    meta: 'meta',
    parents: 'parents',
    permissions: 'permissions',
    resources: 'resources',
    roles: 'roles',
    users: 'users',
  }, options)
}

// ###########app.js

const _ = require('lodash')

const downSql = 'DROP TABLE IF EXISTS "{{prefix}}{{meta}}";' +
	'DROP TABLE IF EXISTS "{{prefix}}{{resources}}";' +
	'DROP TABLE IF EXISTS "{{prefix}}{{parents}}";' +
	'DROP TABLE IF EXISTS "{{prefix}}{{users}}";' +
	'DROP TABLE IF EXISTS "{{prefix}}{{roles}}";' +
	'DROP TABLE IF EXISTS "{{prefix}}{{permissions}}";'
const upSql = 'CREATE TABLE "{{prefix}}{{meta}}" (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);' +
	'INSERT INTO "{{prefix}}{{meta}}" VALUES (\'users\', \'{}\');' +
	'INSERT INTO "{{prefix}}{{meta}}" VALUES (\'roles\', \'{}\');' +
	'CREATE TABLE "{{prefix}}{{resources}}" (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);' +
	'CREATE TABLE "{{prefix}}{{parents}}" (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);' +
	'CREATE TABLE "{{prefix}}{{roles}}" (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);' +
	'CREATE TABLE "{{prefix}}{{users}}" (key TEXT NOT NULL PRIMARY KEY, value TEXT[][] NOT NULL);' +
	'CREATE TABLE "{{prefix}}{{permissions}}" (key TEXT NOT NULL PRIMARY KEY, value JSON NOT NULL);'

function tmpl(str, ctx) {
  let n = 1
  const sql = str.replace(/{{(\w+)}}/g, (match, cap1) => ctx[cap1] || match)
  return sql.replace(/\?/g, () => `$${n++}`)
}

function createTables(callback) {
  let prefix = ''
  const bucketNames = buckets(args[8])

  if (!prefix) prefix = 'acl_'

  knex.raw(tmpl(downSql + upSql, {
    meta: bucketNames.meta,
    parents: bucketNames.parents,
    permissions: bucketNames.permissions,
    prefix,
    resources: bucketNames.resources,
    roles: bucketNames.roles,
    users: bucketNames.users,
  }))
    .then(() => {
      if (!_.isUndefined(callback)) {
        callback(null, db)
      }
    })
}

createTables()
