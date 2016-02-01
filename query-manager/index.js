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

  query() {
    debugger;
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

// class QueryManager {
//   constructor() {
//     // TODO: componentElements is not being used ?
//     this._currentQueries = [];
//     this.containerElement = null;
//     this.stateReceiverElement = null;
//     this.queryHistory = {};
//     this.registeredComponentWrappersCount = 0;
//     this.registeredComponentWrappers = {};
//     this.receivedComponentWrappersCount = 0;
//     this.stateReceiverElements = [];
//     this.transactionRunning = false;
//     this.transactionID = 0;
//     this.credentials = {};
//     this.api = null;
//     this.postponedQueries = [];
//   }

//   // todo: move to this.propsToTransfer
//   setCredentials(credentials) {
//     this.credentials = credentials;
//     this.containerElement.setState({ credentials });
//   }

//   postponeQuery(query) {
//     this.postponedQueries.push(query);
//   }

//   setAccessToken(token) {
//     this.credentials.access_token = token;
//   }

//   beginTransaction(currentQueries) {
//     return new Promise((resolve, reject) => {
//       if (this.transactionRunning) { throw 'Invalid transaction state'; }
//       if (currentQueries) {
//         this._currentQueries = currentQueries;
//       }
//       this.transactionID++;
//       this.transactionRunning = true;
//       console.log('=== BEGIN TRANSACTION', this.transactionID, '===');
//       if (this.queryHistory[this.transactionID]) { throw 'Invalid queryHistory state'; }
//       this.queryHistory[this.transactionID] = {
//         queryInfo: this._currentQueries,
//         state: null,
//         pending: true
//       };
//       resolve();
//     });
//   }

//   finishTransaction(transactionState) {
//     if (typeof transactionState !== 'object') { throw 'Invalid transactionState state'; }
//     if (!this.queryHistory[this.transactionID].pending) { throw 'Invalid pending state'; }
//     if (!this.transactionRunning) { throw 'Invalid transactionRunning state'; }
//     this.queryHistory[this.transactionID].pending = false;
//     this.queryHistory[this.transactionID].state = transactionState;
//     this.transactionRunning = false;
//     this._currentQueries = [];
//     console.log('=== END TRANSACTION', this.transactionID, '===\n ');
//   }

//   registerContainerElement(elem, api) {
//     if (this.containerElement) { throw 'Invalid containerElement state'; }
//     if (this.api) { throw 'Invalid api state'; }
//     this.containerElement = elem;
//     this.api = api;
//   }

//   unregisterContainerElement(elem, api) {
//     if (!this.containerElement) { throw 'Invalid containerElement state'; }
//     if (!this.api) { throw 'Invalid api state'; }
//     debugger
//     this.containerElement = null;
//     this.api = null;
//   }

//   registerStateReceiverElement(elem) {
//     this.stateReceiverElements.push(elem);
//   }

//   unregisterStateReceiverElement(elem) {
//     var idx = this.stateReceiverElements.push(elem);
//     debugger
//     this.stateReceiverElements = this.stateReceiverElements.slice(0, idx)
//       .concat(this.stateReceiverElements.slice(idx + 1));
//   }

//   receiveComponentElement(elem) {
//     if (++this.receivedComponentWrappersCount === this.registeredComponentWrappersCount) {
//       this.allComponentsWereReceived();
//     }
//   }

//   registerComponentElement(element, query) {
//     var elementID = ++this.registeredComponentWrappersCount;
//     this._currentQueries.push(query);
//     this.registeredComponentWrappers[elementID] = element;
//     element._currentQueryNames = Object.keys(query);
//     element._queryWrapperID = elementID;
//   }

//   unregisterComponentElement(element) {
//     var elementID = element._queryWrapperID;
//     debugger
//     delete this.registeredComponentWrappers[elementID];
//     debugger
//   }

//   // TODO: rename to allComponentsAreMounted
//   allComponentsWereReceived() {
//     var lastTransaction = this.queryHistory[this.transactionID];
//     var currentResults = lastTransaction && lastTransaction.state.results || null;
//     this.beginTransaction()
//       .then(this.performQueries.bind(this))
//       .then(this.api.handleResults.bind(null, currentResults))
//       .done(finishFetcher.bind(this));
//   }

//   resolvePostponedQueries() {
//     if (this.postponedQueries.length === 0) { return null; }
//     var lastTransaction = this.queryHistory[this.transactionID];
//     return this.beginTransaction(this.postponedQueries)
//       .then(this.performQueries.bind(this))
//       .then(this.api.handleResults.bind(null, lastTransaction.state.results))
//       .then(res => {
//         this.postponedQueries = [];
//         return res;
//       })
//       .done(finishFetcher.bind(this));
//   }

//   loadMore(element, query) {
//     var lastTransaction = this.queryHistory[this.transactionID];
//     element._currentQueryNames = Object.keys(query);
//     this.beginTransaction([query])
//       .then(this.performQueries.bind(this))
//       .then(this.api.handleResults.bind(null, lastTransaction.state.results))
//       .done(finishFetcher.bind(this));
//   }

//   performQueries() {
//     var currentQueries = this.queryHistory[this.transactionID];
//     if (currentQueries.rootQuery) { throw 'Invalid rootQuery state'; }
//     if (!currentQueries.pending) { throw 'Invalid pending state'; }
//     if (currentQueries.queryInfo.length === 0) {
//       console.warn('no queries at all...');
//       this.finishTransaction(null);
//       return null;
//     }
//     currentQueries.rootQuery = this.api.combineQueries(currentQueries.queryInfo);
//     if (!this.api.performRootQuery) { throw 'Invalid performRootQuery state'; }
//     if (!currentQueries.rootQuery) {
//       console.warn('no queries at all...');
//       this.finishTransaction(null);
//       return null;
//     }
//     var query = currentQueries.rootQuery;
//     console.log('QUERY', query);
//     return this.api.performRootQuery(query,
//                                      this.credentials,
//                                      this.setAccessToken.bind(this),
//                                      this.postponeQuery.bind(this));
//   }
// }

// function finishFetcher(results) {
//   var previousTransaction = this.queryHistory[this.transactionID - 1];
//   var state;
//   if (previousTransaction) {
//     state = {
//       results: previousTransaction.state.results.merge(results)
//     };
//   } else {
//     state = {results};
//   }
//   this.finishTransaction(state);
//   this.stateReceiverElements.forEach(elem => {
//     elem.setState(state);
//   });
// }

module.exports = QueryManager;
