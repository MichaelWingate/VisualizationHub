var React = require('react');
var ReactDOM = require('react-dom');

/* Wrapper component for normal cells. Props:
    data: data displayed in row. Needed to pass upon selection
    width: pixel width of row
    height: pixel height of row
    number: index number of row
    selectPoint: function used when the row is selected
*/
var Row = React.createClass({

  getInitialState: function() {
    /*clicked: true/false whether the row was clicked or not
      hovered: true/false whether the row is hovered over or not
    */
    return{
      clicked: false,
      hovered: false,
    }
  },

  // Marks the row as selected and passes the data to the selection function
  selectRow: function() {
    this.props.selectPoint(this.props.data, !this.state.clicked);
    this.setState({clicked: !this.state.clicked});
  },

  // Toggles the row hover
  onHover: function() {
    this.setState({hovered: true});
  },

  // Toggles the row hover
  onMouseOut: function() {
    this.setState({hovered: false});
  },

  render: function() {
    var props = this.props;

    // Creates alternating shading
    if(props.number%2 == 0) {
      var backgroundColor = "#fff";
    }
    else {
      var backgroundColor = "#efefef";
    }

    // Changes background for hover and click
    if(this.state.hovered) {var backgroundColor = "#a7a7a7";}
    if(this.state.clicked) {var backgroundColor = "#ff6666";}
    return(
      <div style={{width: props.width, height: props.height, backgroundColor: backgroundColor, borderLeft: '1px solid black', borderRight: '1px solid black'}} onClick={this.selectRow} onMouseOver={this.onHover} onMouseOut={this.onMouseOut} >
        {this.props.children}
      </div>
    )
  }
});

module.exports = Row;
