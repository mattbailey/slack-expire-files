#!/usr/bin/env node

const got = require('got')
const Bottleneck = require('bottleneck')
const API_URL = 'https://slack.com/api'

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000,
})

function run(token, options) {
  console.log(
    `Removing files older than ${options.days}d, keep pinned: ${
      options.keepPinned
    }`,
  )
  const ts_to =
    Math.floor(new Date().getTime() / 1000) - parseInt(options.days, 10) * 86400

  got(`${API_URL}/files.list`, {
    body: {
      token,
      ts_to,
      count: 1000,
    },
    json: true,
  })
    .then(response => filterFiles(response.body.files, options))
    .then(files => deleteFiles(token, files))
    .catch(console.error)
}

function filterFiles(files, options) {
  if (!files) {
    throw 'Unexpected response from API. Try generating another token!'
  }

  const removePinned = files => files.filter(file => !file.pinned_to)
  const filesToDelete = options.keepPinned ? removePinned(files) : files

  if (!filesToDelete.length) {
    throw 'There are no files to be deleted.'
  }

  return filesToDelete
}

function deleteFiles(token, files) {
  console.log(`Deleting ${files.length} file(s)...`)

  const limited = limiter.wrap(got)

  files.forEach(file =>
    limited(`${API_URL}/files.delete`, { body: { token, file: file.id } })
      .then(() => console.log(`${file.name} was deleted.`))
      .catch(error => console.error('Error while deleting files.', error)),
  )
}

exports.filterFiles = filterFiles

const keepPinned = (process.env.SLACK_KEEP_PINNED || 'true') === 'true'
const days = process.env.SLACK_KEEP_DAYS || 10

run(process.env.SLACK_TOKEN, {
  days,
  keepPinned,
})
