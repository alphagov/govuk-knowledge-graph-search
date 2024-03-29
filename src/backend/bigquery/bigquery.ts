// todo: split into models

import {
  SearchParams,
  SearchResults,
  InitResults,
} from '../../common/types/search-api-types'
import { splitKeywords } from '../../common/utils/utils'
import { languageCode } from '../../common/utils/lang'
import { BigQuery } from '@google-cloud/bigquery'
import config from '../config'
import log from '../utils/logging'
import { buildSqlQuery } from './buildSqlQuery'

//= ===== private ======

const bigquery = new BigQuery({
  projectId: config.projectId,
})

export const bigQuery = async function (userQuery: string, options?: any) {
  const params: Record<string, string> = {}

  if (options) {
    if (options.keywords) {
      options.keywords.forEach(
        (keyword: string, index: number) =>
          (params[`keyword${index}`] = keyword)
      )
    }
    if (options.excludedKeywords) {
      options.excludedKeywords.forEach(
        (keyword: string, index: number) =>
          (params[`excluded_keyword${index}`] = keyword)
      )
    }
    if (options.name) {
      params.name = options.name
    }
    if (options.locale) {
      params.locale = options.locale
    }
    if (options.taxon) {
      params.taxon = options.taxon
    }
    if (options.organisation) {
      params.organisation = options.organisation
    }
    if (options.link) {
      params.link = options.link
    }
    if (options.phoneNumber) {
      params.phoneNumber = options.phoneNumber
    }
    if (options.documentType) {
      params.documentType = options.documentType
    }
  }

  const bqOptions = {
    query: userQuery,
    location: 'europe-west2',
    params,
  }

  const [rows] = await bigquery.query(bqOptions)

  return rows
}

//= ===== public ======

const sendInitQuery = async function (): Promise<InitResults> {
  let bqLocales: any, bqTaxons: any, bqOrganisations: any, bqDocumentTypes: any
  try {
    ;[bqLocales, bqTaxons, bqOrganisations, bqDocumentTypes] =
      await Promise.all([
        bigQuery(`
        SELECT DISTINCT locale
        FROM \`search.locale\`
        `),
        bigQuery(`
        SELECT DISTINCT name
        FROM \`search.taxon\`
        `),
        bigQuery(`
        SELECT DISTINCT title
        FROM \`search.organisation\`
        `),
        bigQuery(`
        SELECT DISTINCT document_type
        FROM \`search.document_type\`
        `),
      ])
  } catch (error) {
    log.error(error, 'Error in sendInitQueryError')
  }
  return {
    locales: ['', 'en', 'cy'].concat(
      bqLocales
        .map((row: any) => row.locale)
        .filter((locale: string) => locale !== 'en' && locale !== 'cy')
    ),
    taxons: bqTaxons.map((taxon: any) => taxon.name),
    organisations: bqOrganisations.map(
      (organisation: any) => organisation.title
    ),
    documentTypes: bqDocumentTypes.map(
      (documentType: any) => documentType.document_type
    ),
  }
}

// keywords as used here must be exactly the same set of combinedWords as used by the function containDescription.
const sendSearchQuery = async function (
  searchParams: SearchParams
): Promise<SearchResults> {
  const keywords = splitKeywords(searchParams.selectedWords)
  const excludedKeywords = splitKeywords(searchParams.excludedWords)
  const query = buildSqlQuery(searchParams, keywords, excludedKeywords)
  const locale = languageCode(searchParams.language)
  const taxon = searchParams.taxon
  const organisation = searchParams.publishingOrganisation
  const documentType = searchParams.documentType
  const link = searchParams.linkSearchUrl
  const phoneNumber = searchParams.phoneNumber
  const queries = [
    bigQuery(query, {
      keywords,
      excludedKeywords,
      locale,
      taxon,
      organisation,
      link,
      phoneNumber,
      documentType,
    }),
  ]

  const results: unknown[][] = await Promise.all(queries)

  return results[0]
}

export { sendInitQuery, sendSearchQuery }
