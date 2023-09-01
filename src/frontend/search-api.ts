import {
  SearchParams,
  SearchType,
  PublishingApplication,
  Combinator,
  SearchResults,
  UrlParams,
  KeywordLocation,
} from '../common/types/search-api-types'
import { defaultAllLanguagesOption, languageCode } from '../common/utils/lang'
import { EventType, SearchApiCallback } from './types/event-types'

const makeQueryString = function (sp: SearchParams): string {
  const usp = new URLSearchParams()
  if (sp.searchType !== SearchType.Keyword)
    usp.set(UrlParams.SearchType, sp.searchType)
  if (sp.selectedWords !== '')
    usp.set(UrlParams.SelectedWords, sp.selectedWords)
  if (sp.excludedWords !== '')
    usp.set(UrlParams.ExcludedWords, sp.excludedWords)
  if (sp.selectedTaxon !== '')
    usp.set(UrlParams.SelectedTaxon, sp.selectedTaxon)
  if (sp.selectedPublishingOrganisation !== '')
    usp.set(
      UrlParams.SelectedPublishingOrganisation,
      sp.selectedPublishingOrganisation
    )
  if (sp.selectedLocale !== defaultAllLanguagesOption)
    usp.set(UrlParams.Language, languageCode(sp.selectedLocale))
  if (sp.caseSensitive)
    usp.set(UrlParams.CaseSensitive, sp.caseSensitive.toString())
  if (sp.keywordLocation !== KeywordLocation.All) {
    usp.set(UrlParams.KeywordLocation, sp.keywordLocation)
  }

  if (sp.selectedDocumentType)
    usp.set(UrlParams.DocumentType, sp.selectedDocumentType)

  if (sp.publishingApplication !== PublishingApplication.Any) {
    usp.set(UrlParams.PublishingApplication, sp.publishingApplication)
  }
  if (sp.combinator !== Combinator.All)
    usp.set(UrlParams.Combinator, sp.combinator)
  if (sp.linkSearchUrl !== '')
    usp.set(UrlParams.LinkSearchUrl, sp.linkSearchUrl)
  usp.set(UrlParams.PublishingStatus, sp.publishingStatus)
  return usp.toString()
}

const fetchWithTimeout = async function (url: string, timeoutSeconds = 60) {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeoutSeconds * 1000)
  const fetchResult = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'fetch',
    },
    signal: controller.signal,
  })

  if (fetchResult.status === 401) {
    // Reload the page to trigger server-side authentication
    location.reload()
  }

  const responseBody = await fetchResult.json()

  if (!fetchResult.ok) {
    if (/^timeout of \d+ms exceeded/.test(responseBody.message)) {
      throw new Error('TIMEOUT')
    } else {
      throw new Error('UNKNOWN')
    }
  } else {
    return responseBody
  }
}

// called from browser
const queryBackend: (
  searchParams: SearchParams,
  callback: SearchApiCallback
) => Promise<void> = async function (searchParams, callback) {
  // TODO: find another way than using a callback function to get rid of the eslint error
  // eslint-disable-next-line n/no-callback-literal
  callback({ type: EventType.SearchRunning })
  searchParams.selectedWords = searchParams.selectedWords.replace(/[“”]/g, '"')
  searchParams.excludedWords = searchParams.excludedWords.replace(/[“”]/g, '"')
  const url = `/search?${makeQueryString(searchParams)}`

  let apiResults: SearchResults
  try {
    apiResults = await fetchWithTimeout(url, 300)
  } catch (error: any) {
    console.log('error running main+meta queries', error)
    // TODO: find another way than using a callback function to get rid of the eslint error
    // eslint-disable-next-line n/no-callback-literal
    callback({ type: EventType.SearchApiCallbackFail, error })
    return
  }
  let { main, meta } = apiResults
  // If there's an exact match within the meta results, just keep that one
  const searchKeywords: string = searchParams.selectedWords.replace(/"/g, '')
  const exactMetaResults = meta.filter((result: any) => {
    return result.name.toLowerCase() === searchKeywords.toLowerCase()
  })
  if (exactMetaResults.length === 1) {
    meta = exactMetaResults
  }
  if (meta.length === 1) {
    // one meta result: show the knowledge panel (may require more API queries)
    const fullMetaResults = await buildMetaboxInfo(meta[0])
    // TODO: find another way than using a callback function to get rid of the eslint error
    // eslint-disable-next-line n/no-callback-literal
    callback({
      type: EventType.SearchApiCallbackOk,
      results: { main, meta: fullMetaResults },
    })
    // } else if (metaResults.length >= 1) {
    //   // multiple meta results: we'll show a disambiguation page
    //   callback({ type: EventType.SearchApiCallbackOk, results: { main, meta: metaResults } });
  } else {
    // no meta results
    // TODO: find another way than using a callback function to get rid of the eslint error
    // eslint-disable-next-line n/no-callback-literal
    callback({
      type: EventType.SearchApiCallbackOk,
      results: { main, meta: null },
    })
  }
}

//= ========== private ===========

const buildMetaboxInfo = async function (info: any) {
  console.log(`Found a ${info.type}. Running extra queries`)
  console.log(info)
  switch (info.type) {
    case 'BankHoliday': {
      return await fetchWithTimeout(
        `/bank-holiday?name=${encodeURIComponent(info.name)}`
      )
    }
    case 'Person': {
      return await fetchWithTimeout(
        `/person?name=${encodeURIComponent(info.name)}`
      )
    }
    case 'Role': {
      return await fetchWithTimeout(
        `/role?name=${encodeURIComponent(info.name)}`
      )
    }
    case 'Organisation': {
      return await fetchWithTimeout(
        `/organisation?name=${encodeURIComponent(info.name)}`
      )
    }
    case 'Transaction': {
      return await fetchWithTimeout(
        `/transaction?name=${encodeURIComponent(info.name)}`
      )
    }
    case 'Taxon': {
      return await fetchWithTimeout(
        `/taxon?name=${encodeURIComponent(info.name)}`
      )
    }
    default:
      console.log('unknown meta node type', info.type)
  }
}

export { makeQueryString, fetchWithTimeout, queryBackend }
