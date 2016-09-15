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
      <div style={{position: 'relative', width: props.width, height: props.height, float: 'left', borderRight: '1px solid black', textAlign: 'center', backgroundColor: props.color}} >
      <div style={{position: 'absolute', top: 0, left: 0, width: props.barWidth, height: props.height, float: 'left', backgroundColor: "blue", opacity: '0.5'}} />
        <p>{props.data}</p>
      </div>
    )
  }
});

module.exports = Cell;
