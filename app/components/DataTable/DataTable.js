var React = require('react');
var ReactDOM = require('react-dom');
var TableSeries = require('./TableSeries');

/* Top level component for Data Table. Props:
      width: integer for overall width of table
      height: integer for overall height of table
      data: object of data to be displayed in table
      colNames: array of strings to be displayed as column headers
      colRefs: array of strings corresponding to the data object's references
        (indices corresponding with the colNames)
      cellStyle: array of strings describing the style to give data cols specified by
        styleRefs prop (corresponding indices). Options are: "bar" and "shade".
      styleRefs: array of strings corresponding to the data object's references
        for the columns that should be styled.
      selectPoint: function to execute when a row is clicked. The function is passed
        the ID of the clicked row.
*/
var DataTable = React.createClass({
  render: function() {
    var props = this.props;
    // colRefs should have the first col be the unique ID, otherwise things will break
    return(
      <TableSeries width={props.width} height={props.height} data={props.data} colNames={props.colNames} colRefs={props.colRefs} cellStyle={props.cellStyle}
        styleRefs={["Temp"]} selectPoint={props.selectPoint}/>
    )
  }
});

module.exports = DataTable;
