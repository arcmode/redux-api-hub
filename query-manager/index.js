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
    this.container = container;
    this.reset();
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
      component.props.dispatch(Actions.query({api, query: reducedQuery}));
    }
  }
}

QueryManager.Actions = Actions;
QueryManager.createReducer = function({namespace, initialState, handlers}) {
  const {onAdd, onReset, onFetching, onError, onReplace} = handlers;
  const format = {
    [`${namespace}_ADD`]: (state, action) => onAdd(state, action.payload),
    [`${namespace}_RESET`]: (state, action) => onReset(state, action.payload),
    [`${namespace}_FETCHING`]: (state, action) => onFetching(state, action.payload),
    [`${namespace}_ERROR`]: (state, action) => onError(state, action.payload),
    [`${namespace}_REPLACE`]: (state, action) => onReplace(state, action.payload)
  };
  return (state = initialState, action) => {
    const handler = format[action.type];
    return handler && handler(state, action) || state;
  };
};

module.exports = QueryManager;
