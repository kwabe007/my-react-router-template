import { Database } from '@paralect/node-mongo'

export async function createIndexIfNotExists(
  db: Database,
  collectionName: string,
  indexSpec: string | string[],
  unique = false
) {
  const service = db.createService(collectionName)
  const indexName = Array.isArray(indexSpec) ? indexSpec.join('_1_') + '_1' : indexSpec + '_1'
  if (await service.indexExists(indexName)) {
    return
  }
  if (Array.isArray(indexSpec)) {
    console.log(
      `Creating unique index on fields '${indexSpec.join(', ')}' in collection ${collectionName}`
    )
  } else {
    console.log(`Creating unique index on field '${indexSpec}' in collection ${collectionName}`)
  }
  return service.createIndex(indexSpec, { unique })
}
