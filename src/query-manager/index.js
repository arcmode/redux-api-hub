/**
*
* Query
*
*/

'use strict';

import Immutable from 'immutable';
import Actions from './actions';

class QueryManager {
  constructor(api) {
    this.container = null;
    this.api = api;
    this.componentsQueryIndex = null;
    this.pendingComponentIDs = null;
    this.lastID = 0;
  }

  reset() {
    // { id => query }
    this.componentsQueryIndex = Immutable.Map({});
    // #{ id }
    this.pendingComponentIDs = Immutable.Set();
    // "auto increment" id for registered components
    this.lastID = 0;
  }

  containerWillMount(container) {
    this.reset();
    this.componentWillMount(container);
    this.container = container;
  }

  componentWillMount(component) {
    const id = ++this.lastID;
    component._queryComponentID = id;
    this.pendingComponentIDs = this.pendingComponentIDs.add(id);
  }

  componentDidMount(component, query) {
    const id = component._queryComponentID;
    const {api} = this;
    const queryMerger = (prev, next) => options => next(prev(options));
    if (typeof query === 'function') {
      const propedQuery = query(component.props);
      if (propedQuery) {
        this.componentsQueryIndex = this.componentsQueryIndex.set(id, propedQuery);
      }
    }
    this.pendingComponentIDs = this.pendingComponentIDs.remove(id);
    if (this.pendingComponentIDs.size === 0) {
      let reducedQuery = this.componentsQueryIndex.reduce(
        (reduced, proped, componentID, queryIndex) => {
          return reduced.mergeWith(queryMerger, proped);
        }, Immutable.Map({})).toJS();
      this.componentsQueryIndex = Immutable.Map({});
      (component.props.dispatch || component.props.store.dispatch)(
        Actions.query({api, query: reducedQuery}));
    }

  }

  containerDidMount(container, query) {
    this.componentDidMount(container, query);
  }
}

QueryManager.Actions = Actions;
QueryManager.createReducer = function({scope, initialState, handlers}) {
  const {onAdd, onReset, onFetching, onError, onErrorClear, onReplace} = handlers;
  const format = {
    [`QUERY_RESULTS_ADD`]: (state, action) => {
      let { payload } = action;
      let results = payload.filter(keyIn.apply(null, scope));
      return (results.size > 0) ?
        onAdd(state, results)
        : null;
    },
    [`QUERY_RESULTS_RESET`]: (state, action) => {
      if (!Array.isArray(action.payload.scope)) {
        throw new Error('invalid payload'); };
      let intersection = intersect(scope, action.payload.scope);
      return (intersection.length > 0) ?
        onReset(
          state, Object.assign(
            {}, action, { payload: Object.assign(
              {}, action.payload, { scope: intersection})}))
      : null;
    },
    [`QUERY_RESULTS_FETCHING`]: (state, action) => {
      if (!Array.isArray(action.payload)) { throw new Error('invalid payload'); };
      let intersection = intersect(scope, action.payload);
      return (intersection.length > 0) ?
        onFetching(state, intersection)
        : null;
    },
    [`QUERY_RESULTS_ERROR`]: (state, action) => {
      return (scope.indexOf(action.payload.query) > -1) ?
        onError(state, action)
        : null;
    },
    [`QUERY_RESULTS_ERROR_CLEAR`]: (state, action) => {
      if (!Array.isArray(action.payload.scope)) {
        throw new Error('invalid payload'); };
      let intersection = intersect(scope, action.payload.scope);
      return (intersection.length > 0) ?
        onErrorClear(
          state, Object.assign(
            {}, action, { payload: Object.assign(
              {}, action.payload, { scope: intersection})}))
        : null;
    },
    [`QUERY_RESULTS_REPLACE`]: (state, action) => {
      return onReplace(state, action);
    }
  };

  return (state = initialState, action) => {
    const handler = format[action.type];
    if (typeof handler === 'function') {
      return handler(state, action) || state;
    }

    return state;
  };
};

module.exports = QueryManager;

function intersect(a, b)
{
  return a.filter(function(n) {
    return b.indexOf(n) != -1;
  });
}

function keyIn(/*...keys*/) {
  var keySet = Immutable.Set(arguments); 
  return function (v, k) {
    return keySet.has(k);
  };
}
