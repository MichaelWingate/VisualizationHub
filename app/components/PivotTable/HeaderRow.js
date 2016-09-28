var React = require('react');
var ReactDOM = require('react-dom');

/* Wrapper component for controlling and styling the header cells. Props:
    width: pixel width of row
    height: pixel height of row
    children: headerCells to go in row
*/
var HeaderRow = React.createClass({
  render: function() {
    var props = this.props;
    return(
      <div style={{width: props.width, height: props.height, border: '1px solid black',}} >
        {this.props.children}
      </div>
    )
  }
});

module.exports = HeaderRow;
