/**
*
* Connector
*
*/

'use strict';

var React = require('react-native');

export const connectComponent = query => component => {
  class QueryHOC extends React.Component {
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
      return React.createElement(component, Object.assign({}, this.props));
    }
  };

  QueryHOC.displayName = `ReduxQuery(${component.displayName})`;
  QueryHOC.contextTypes = {
    queryAdapter: React.PropTypes.object
  };

  return QueryHOC;
};

export function connectContainer(container){
  var containerClass = React.createClass({
    displayName: `ReduxQueryRoot(${container.displayName})`,
    childContextTypes: {
      queryAdapter: React.PropTypes.object
    },
    getChildContext: function() {
      return {
        queryAdapter: this.props.queryAdapter
      };
    },
    componentWillMount: function() {
      this.props.queryAdapter.containerWillMount(this);
    },
    componentWillUnmount: function() {
      debugger
    },
    render: function() {
      return React.createElement(container, Object.assign({}, this.props));
    },
  });
  return containerClass;
}
