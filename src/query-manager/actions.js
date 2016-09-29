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
export function queryResultsAdd(payload) {
  return {
    type: QUERY_RESULTS_ADD,
    payload
  };
}

export const QUERY_RESULTS_RESET = 'QUERY_RESULTS_RESET';
export function queryResultsReset(payload) {
  return {
    type: QUERY_RESULTS_RESET,
    payload
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

export const QUERY_RESULTS_ERROR_CLEAR = 'QUERY_RESULTS_ERROR_CLEAR';
export function queryResultsErrorClear(payload) {
  return {
    type: QUERY_RESULTS_ERROR_CLEAR,
    payload,
  };
}

export function query(options) {
  return function(dispatch, getState) {
    const { api } = options;
    let promise = api.performRootQuery(options.query, dispatch)
        .then(results => {
          dispatch(queryResultsAdd(results));
          return results;
        });
    return options.returnPromise ?
      promise
      : promise.done(options.callback || (() => void 0));
  };
}

export default {
  query,
  queryResultsAdd,
  queryResultsReset,
  queryResultsError,
  queryResultsFetching,
  queryResultsErrorClear,
};
