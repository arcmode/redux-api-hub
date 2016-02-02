
'use strict';

import QueryManager from './query-manager/index';
import RequestError from './query-manager/request-error';
import { combineQueries } from './query-manager/combinator';
import { performRootQuery } from './query-manager/api-adapter';
import {
  connectContainer,
  connectComponent
} from './query-manager/connector';

export {
  QueryManager,
  RequestError,
  connectComponent,
  connectContainer,
  combineQueries,
  performRootQuery,
}
