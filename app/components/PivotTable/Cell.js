var React = require('react');
var ReactDOM = require('react-dom');

/* Renders one cell in the table. Props:
    width: width of cell
    height: height of cell
    color: background color of cell
    data: contents of cell
    barWidth: width of background bar shading

*/
var Cell = React.createClass({
  render: function() {
    var props = this.props;
    return(
      <div style={{position: 'relative', width: props.width, height: props.height, float: 'left', borderRight: '1px solid black', textAlign: 'center'}} >
        <p>{props.data}</p>
      </div>
    )
  }
});

module.exports = Cell;
