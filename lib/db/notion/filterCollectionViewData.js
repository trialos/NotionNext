function filterCollectionViewData(blockMap) {
  if (!blockMap?.collection_view || !blockMap?.collection_query) return

  Object.values(blockMap.collection_view).forEach(entry => {
    const view = entry?.value?.value || entry?.value || entry
    if (!view?.id) return

    const collectionId = view?.format?.collection_pointer?.id
    const filters = view?.format?.property_filters
    const collectionQuery = getRecordById(blockMap.collection_query, collectionId)
    const viewQuery = getRecordById(collectionQuery, view.id)

    if (!collectionId || !Array.isArray(filters) || !viewQuery) return

    filterBlockIdsInPlace(viewQuery, blockId => {
      const block = blockMap.block?.[blockId]?.value
      return matchesPropertyFilters(block, filters)
    })

    if (Array.isArray(view.page_sort)) {
      view.page_sort = view.page_sort.filter(blockId => {
        const block = blockMap.block?.[blockId]?.value
        return matchesPropertyFilters(block, filters)
      })
    }
  })
}

function filterBlockIdsInPlace(value, predicate) {
  if (!value || typeof value !== 'object') return

  if (Array.isArray(value.blockIds)) {
    value.blockIds = value.blockIds.filter(predicate)
  }

  Object.values(value).forEach(child => filterBlockIdsInPlace(child, predicate))
}

function matchesPropertyFilters(block, filters) {
  if (!block?.properties) return false

  return filters.every(filterItem => {
    const propertyId = filterItem?.filter?.property
    const filter = filterItem?.filter?.filter
    if (!propertyId || !filter) return true

    const values = getPropertyValues(block.properties[propertyId])
    return matchesFilter(values, filter)
  })
}

function matchesFilter(values, filter) {
  const expectedValues = getExpectedValues(filter.value)

  switch (filter.operator) {
    case 'enum_is':
      return expectedValues.some(value => values.includes(value))
    case 'enum_is_not':
      return expectedValues.every(value => !values.includes(value))
    case 'enum_contains':
      return expectedValues.some(value => values.includes(value))
    case 'enum_does_not_contain':
      return expectedValues.every(value => !values.includes(value))
    case 'string_contains':
      return expectedValues.some(value =>
        values.some(current => current.includes(value))
      )
    case 'string_does_not_contain':
      return expectedValues.every(value =>
        values.every(current => !current.includes(value))
      )
    case 'string_is':
      return expectedValues.some(value => values.includes(value))
    case 'string_is_not':
      return expectedValues.every(value => !values.includes(value))
    case 'is_empty':
      return values.length === 0
    case 'is_not_empty':
      return values.length > 0
    default:
      return true
  }
}

function getPropertyValues(property) {
  if (!Array.isArray(property)) return []

  return property
    .map(item => item?.[0])
    .filter(value => typeof value === 'string' && value.length > 0)
}

function getExpectedValues(value) {
  if (Array.isArray(value)) {
    return value
      .map(item => item?.value)
      .filter(item => typeof item === 'string')
  }

  if (typeof value?.value === 'string') return [value.value]
  if (typeof value === 'string') return [value]

  return []
}

function getRecordById(record, id) {
  if (!record || !id) return null

  for (const candidate of getIdCandidates(id)) {
    const value = record[candidate]
    if (value) return value
  }

  return null
}

function getIdCandidates(id) {
  const candidates = new Set([id])

  if (typeof id === 'string') {
    const compactId = id.replace(/-/g, '')
    candidates.add(compactId)

    if (/^[0-9a-fA-F]{32}$/.test(compactId)) {
      candidates.add(
        [
          compactId.slice(0, 8),
          compactId.slice(8, 12),
          compactId.slice(12, 16),
          compactId.slice(16, 20),
          compactId.slice(20)
        ].join('-')
      )
    }
  }

  return [...candidates]
}

export {
  filterCollectionViewData,
  matchesPropertyFilters
}
