//==================================================
// Cypher query methods
//==================================================

import { state } from './state.js';
import { languageCode } from './lang.js';


const containsClause = function(field, word, caseSensitive) {
  return caseSensitive ?
    `(n.${field} CONTAINS "${word}")`
  :
    `(toLower(n.${field}) CONTAINS toLower("${word}"))`
  ;
}


const multiContainsClause = function(fields, word, caseSensitive) {
  return '(' + fields
    .map(field => containsClause(field, word, caseSensitive))
    .join(' OR ') + ')'
}


const returnClause = function() {
  return `RETURN
    'https://www.gov.uk' + n.name as url,
    n.title AS title,
    n.documentType AS documentType,
    n.contentID AS contentID,
    n.locale AS locale,
    n.publishing_app AS publishing_app,
    n.first_published_at AS first_published_at,
    n.public_updated_at AS public_updated_at,
    n.withdrawn_at AS withdrawn_at,
    n.withdrawn_explanation AS withdrawn_explanation,
    n.pagerank AS pagerank,
    COLLECT (distinct taxon.name) AS taxons,
    COLLECT (distinct o.name) AS primary_organisation,
    COLLECT (distinct o2.name) AS all_organisations
    ORDER BY n.pagerank DESC
    LIMIT ${state.nbResultsLimit}`;
};


const searchQuery = function(state, keywords, exclusions) {
  const fieldsToSearch = [];
  const combinator = state.combinator === 'any' ? 'OR' : 'AND';
  if (state.whereToSearch.title) fieldsToSearch.push('title');
  if (state.whereToSearch.text) fieldsToSearch.push('title', 'description');

  let inclusionClause = '';
  if (keywords.length > 0) {
    inclusionClause = 'WHERE\n' +
    keywords
      .map(word => multiContainsClause(fieldsToSearch, word, state.caseSensitive))
      .join(`\n ${combinator}`);
  }

  const exclusionClause = exclusions.length ?
    ('WITH * WHERE NOT ' + exclusions.map(word => multiContainsClause(fieldsToSearch, word, state.caseSensitive)).join(`\n OR `)) : '';

  let areaClause = '';
  if (state.areaToSearch === 'mainstream') {
    areaClause = 'WITH * WHERE n.publishing_app = "publisher"';
  } else if (state.areaToSearch === 'whitehall') {
    areaClause = 'WITH * WHERE n.publishing_app = "whitehall"';
  }

  let localeClause = '';
  if (state.selectedLocale !== '') {
    localeClause = `WITH * WHERE n.locale = "${languageCode(state.selectedLocale)}"\n`
  }

  const taxon = state.selectedTaxon;
  const taxonClause = taxon ? `WITH n
    MATCH (n:Cid)-[:IS_TAGGED_TO]->(taxon:Taxon)
    MATCH (taxon:Taxon)-[:HAS_PARENT*]->(ancestor_taxon:Taxon)
    WHERE taxon.name = "${taxon}" OR ancestor_taxon.name = "${taxon}"` :
    `OPTIONAL MATCH (n:Cid)-[:IS_TAGGED_TO]->(taxon:Taxon)`;

  let linkClause = '';

  if (state.linkSearchUrl.length > 0) {
    // We need to determine if the link is internal or external
    const internalLinkRexExp = /^((https:\/\/)?((www\.)?gov\.uk))?\//;
    if (internalLinkRexExp.test(state.linkSearchUrl)) {
      linkClause = `
        WITH n, taxon
        MATCH (n:Cid)-[:HYPERLINKS_TO]->(n2:Cid)
        WHERE n2.name = "${state.linkSearchUrl.replace(internalLinkRexExp, '/')}"`
    } else {
      linkClause = `
        WITH n, taxon
        MATCH (n:Cid) -[:HYPERLINKS_TO]-> (e:ExternalPage)
        WHERE e.name CONTAINS "${state.linkSearchUrl}"`
    }
  }

  return `
    MATCH (n:Cid)
    ${inclusionClause}
    ${exclusionClause}
    ${localeClause}
    ${areaClause}
    ${taxonClause}
    ${linkClause}
    OPTIONAL MATCH (n:Cid)-[r:HAS_PRIMARY_PUBLISHING_ORGANISATION]->(o:Organisation)
    OPTIONAL MATCH (n:Cid)-[:HAS_ORGANISATIONS]->(o2:Organisation)
    ${returnClause()}`;
};


const queryGraph = async function(query, callback) {
  state.neo4jSession
    .run(query)
    .then(result => callback({type:'neo4j-callback-ok', result}))
    .catch(error => callback({type:'neo4j-callback-fail', error}));
  callback({type: 'neo4j-running'});
};


export { searchQuery, queryGraph };