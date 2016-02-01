/**
*
* Combinator
*
*/

'use strict';

function combineQueries(listOfQueries) {
  return listOfQueries.reduce(queryCombinatorReducer, {});
}

function queryCombinatorReducer(combinedQuery, query, idx, allClasses) {
  var classQueries = Object.keys(query);
  return classQueries.reduce(genQueryReducer(query), combinedQuery);
}

function genQueryReducer(query) {
  return function(combinedQuery, queryName, idx, allQueries) {
    var queryCandidate = query[queryName];
    combinedQuery[queryName] = (typeof queryCandidate === 'function') ?
      queryCandidate(combinedQuery[queryName]) :
      queryCandidate;
    return combinedQuery;
  };
}

export {
  combineQueries,
};
