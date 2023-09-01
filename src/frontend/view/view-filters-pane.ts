import {
  Combinator,
  KeywordLocation,
  PublishingApplication,
} from '../../common/types/search-api-types'
import { state } from '../state'

const viewKeywordsRadioButtons = () => `
<div class="govuk-form-group">
  <fieldset class="govuk-fieldset">
    <legend class="govuk-fieldset__legend govuk-fieldset__legend--l">
      <h1 class="govuk-fieldset__heading">
        Search for
      </h1>
    </legend>
    <div class="govuk-radios" data-module="govuk-radios">
      <div class="govuk-radios__item">
        <input class="govuk-radios__input" id="search-for-1" name="search-for" type="radio" value="${
          Combinator.All
        }" ${state.searchParams.combinator === Combinator.All ? 'checked' : ''}>
        <label class="govuk-label govuk-radios__label" for="search-for">
          All keywords
        </label>
      </div>
      <div class="govuk-radios__item">
        <input class="govuk-radios__input" id="search-for-2" name="search-for" type="radio" value="${
          Combinator.Any
        }" ${state.searchParams.combinator === Combinator.Any ? 'checked' : ''}>
        <label class="govuk-label govuk-radios__label" for="search-for">
          Any keyword
        </label>
      </div>
    </div>
  </fieldset>
</div>
`

const viewExcludeWords = () => `
<div class="govuk-form-group">
  <label class="govuk-label" for="filter-excluded-keywords">
    Excluding these words
  </label>
  <input class="govuk-input" id="filter-excluded-keywords" name="filter-excluded-keywords" type="text" value="${state.searchParams.excludedWords}">
</div>
`

const viewSelectKeywordLocation = () => `
<div class="govuk-form-group">
  <label class="govuk-label" for="filter-keyword-location">
    Keyword location
  </label>
  <select class="govuk-select" id="filter-keyword-location" name="filter-keyword-location">
    <option value="${KeywordLocation.All}" ${
  state.searchParams.keywordLocation === KeywordLocation.All ? 'selected' : ''
}>All keyword locations</option>
    <option value="${KeywordLocation.Title}" ${
  state.searchParams.keywordLocation === KeywordLocation.Title ? 'selected' : ''
}>Title</option>
    <option value="${KeywordLocation.BodyContent}" ${
  state.searchParams.keywordLocation === KeywordLocation.BodyContent
    ? 'selected'
    : ''
}>Body content</option>
    <option value="${KeywordLocation.Description}" ${
  state.searchParams.keywordLocation === KeywordLocation.Description
    ? 'selected'
    : ''
}>Description</option>
  </select>
</div>
`

const viewSelectPublishingOrganisations = () => {
  const html = [
    `
    <div class="govuk-form-group" data-state="${state.waiting && 'disabled'}">
      <label class="govuk-label govuk-label--s" for="filter-publishing-organisation">
        Publishing organisations
      </label>
      <select ${
        state.waiting && 'disabled="disabled"'
      } id="filter-publishing-organisation" class="autocomplete__input autocomplete__input--default" name="filter-publishing-organisation">
      <option value="" ></option>
  `,
  ]

  html.push(`
      ${html.push(
        ...state.organisations
          .sort()
          .map(
            (organisation) =>
              `<option value="${organisation}" ${
                state.searchParams.selectedPublishingOrganisation ===
                organisation
                  ? 'selected'
                  : ''
              }>${organisation}</option>`
          )
      )}
        </select>
    </div>`)
  return html.join('')
}

const viewDocumentTypeSelector = () => {
  const html = [
    `
    <div class="govuk-form-group" data-state="${state.waiting && 'disabled'}">
      <label class="govuk-label govuk-label--s" for="filter-document-type">
        Document type
      </label>
      <select ${
        state.waiting && 'disabled="disabled"'
      } id="filter-document-type" class="autocomplete__input autocomplete__input--default" name="documentType">
      <option value="" ></option>
  `,
  ]

  html.push(`
      ${html.push(
        ...state.documentTypes
          .sort()
          .map(
            (documentType) =>
              `<option value="${documentType}" ${
                state.searchParams.selectedDocumentType == documentType
                  ? 'selected'
                  : ''
              }>${(
                documentType.charAt(0).toUpperCase() + documentType.slice(1)
              ).replace(/_/g, ' ')}</option>`
          )
      )}
        </select>
    </div>`)
  return html.join('')
}

const viewPublishingApplications = () => `
      <div class="govuk-form-group" data-state="${state.waiting && 'disabled'}">
        <label class="govuk-label govuk-label--s" for="filter-publishing-application">
          Publishing applications
        </label>
        <select ${
          state.waiting && 'disabled="disabled"'
        } id="filter-publishing-application" class="govuk-select" name="filter-publishing-application" style="width: 100%;">
          <option value="${PublishingApplication.Any}" ${
  state.searchParams.publishingApplication === PublishingApplication.Any
    ? 'selected'
    : ''
}>All publishing applications</option>
          <option value="${PublishingApplication.Publisher}" ${
  state.searchParams.publishingApplication === PublishingApplication.Publisher
    ? 'selected'
    : ''
}>Publisher (mainstream)</option>
          <option value="${PublishingApplication.Whitehall}" ${
  state.searchParams.publishingApplication === PublishingApplication.Whitehall
    ? 'selected'
    : ''
}>Whitehall (specialist)</option>
        </select>
    </div>`

export const viewFiltersPane = () => {
  const submitButton = `
    <button id="filters-pane-submit-btn" class="govuk-button" data-module="govuk-button">Search</button>
    `
  return `
    <div class="filters-pane">
      ${viewKeywordsRadioButtons()}
      ${viewExcludeWords()}
      ${viewSelectKeywordLocation()}
      ${viewSelectPublishingOrganisations()}
      ${viewDocumentTypeSelector()}
      ${viewPublishingApplications()}
      ${submitButton}
    </div>
    `
}