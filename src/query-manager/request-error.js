/**
*
* RequestError
*
*/

'use strict';

var ExtendableError = require('es6-error');

export default class RequestError extends ExtendableError {
  constructor({query, request, response, error, body}) {
    super(error.message);
    // this.name = 'RequestError';
    this.status = error.status;
    this.request = request;
    this.response = response;
    this.body = body;
    this.query = query;

    this.ACCESS_TOKEN_EXPIRED = (
      this.status === 401 &&
      this.message === 'The access token expired'
    );

    this.INSUFFICIENT_CLIENT_SCOPE = (
      this.status === 403 &&
      this.message === 'Insufficient client scope'
    );
  }
}
