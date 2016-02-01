/*
 *
 * Query Adapter Actions
 *
 */

'use strict';

export const QUERY_RESULTS_FETCHING = 'QUERY_RESULTS_FETCHING';
export function queryResultsFetching(query) {
  return {
    type: QUERY_RESULTS_FETCHING,
    payload: query,
  };
}

export const QUERY_RESULTS_ADD = 'QUERY_RESULTS_ADD';
export function queryResultsAdd(results) {
  return {
    type: QUERY_RESULTS_ADD,
    payload: results
  };
}

export const QUERY_RESULTS_RESET = 'QUERY_RESULTS_RESET';
export function queryResultsReset(results) {
  return {
    type: QUERY_RESULTS_RESET,
    payload: results
  };
}

export const QUERY_RESULTS_ERROR = 'QUERY_RESULTS_ERROR';
export function queryResultsError(error) {
  return {
    type: QUERY_RESULTS_ERROR,
    payload: error,
    error: true
  };
}

export function query(options) {
  return function(dispatch) {
    const {api} = options;
    return api.performRootQuery(options.query, dispatch)
      .then(results => {
        dispatch(queryResultsAdd(results));
        return results;
      })
      .catch(error => {
        //console.log('ERROR', error, (error instanceof Error));
        throw error;
      })
      .done(results => {
        results
          .map(queryResults => queryResults.get('error'))
          .filter(e => !!e).valueSeq()
          .forEach(e => {
            dispatch(queryResultsError(e));
          });
      });
  };
}

export default {
  query,
  queryResultsAdd,
  queryResultsReset,
  queryResultsError,
  queryResultsFetching,
}
