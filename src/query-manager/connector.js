/**
*
* Connector
*
*/

'use strict';

export const connectComponent = React => query => component => {
  class QueryComponentHOC extends React.Component {
    constructor(props) {
      super(props);
    }

    componentWillMount() {
      this.context.queryAdapter.componentWillMount(this);
    }

    componentDidMount() {
      this.context.queryAdapter.componentDidMount(this, query);
    }

    render(){
      return React.createElement(
        component, Object.assign(
          {}, this.props, { ref: 'wrappedInstance' }));
    }
  };

  QueryComponentHOC.displayName = `ReduxQueryComponent(${component.displayName})`;
  QueryComponentHOC.contextTypes = {
    queryAdapter: React.PropTypes.object
  };

  return QueryComponentHOC;
};

export const connectContainer = React => container => {
  class QueryContainerHOC extends React.Component {
    constructor(props) {
      super(props);
    }

    componentWillMount() {
      this.props.queryAdapter.containerWillMount(this);
    }

    componentDidMount() {
      this.props.queryAdapter.containerDidMount(this, this.props.query);
    }

    getChildContext() {
      return {
        queryAdapter: this.props.queryAdapter
      };
    }

    render() {
      return React.createElement(container, Object.assign({}, this.props));
    }
  }

  QueryContainerHOC.displayName = `ReduxQueryContainer(${container.displayName})`;
  QueryContainerHOC.childContextTypes = {
    queryAdapter: React.PropTypes.object
  };

  return QueryContainerHOC;
};

