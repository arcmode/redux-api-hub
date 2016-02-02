
'use strict';

import Immutable from 'immutable';
import { queryResultsFetching } from './actions';

function performRootQuery(plainRootQuery, dispatch, performQuery, seedPromise) {
  if (!seedPromise) {
    seedPromise = Promise.resolve({});
  }
  let rootQuery = Immutable.fromJS(plainRootQuery).map(query => {
    if (typeof query === 'function') {
      // TODO: get defaults from api object
      return Immutable.fromJS(query({}));
    }
    return query;
  });
  let resourcesFetching = rootQuery.map(
    q => q && q.get('resources', null) || null)
        .flatten().valueSeq().toJS();
  dispatch(queryResultsFetching(resourcesFetching));
  return Object.keys(rootQuery.toJS()).reduce((queryPromise, name) => {
    return queryPromise.then(results => {
      let query = rootQuery.get(name);
      let queryOpts = {
        query,
        name,
      };
      return performQuery(queryOpts, dispatch)
        .then(queryResults => {
          results[name] = queryResults;
          return results;
        });
    });
  }, seedPromise).then(results => Immutable.fromJS(results));
}

export {
  performRootQuery
};
