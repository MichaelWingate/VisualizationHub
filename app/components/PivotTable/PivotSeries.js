var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');
var Row = require('./Row');
var Cell = require('./Cell');
var HeaderCell = require('./HeaderCell');
var HeaderRow = require('./HeaderRow');
var OptionCell = require('./OptionCell');
var PivotChart = require('../PivotChart/PivotChart');
var _ = require('underscore');
var $ = require('jquery');

var PivotSeries = React.createClass({
  getInitialState: function() {
    return {
      measurementType: this.props.initialMeasurementType,
      measurement: this.props.initialMeasurementRef,
      rowField: this.props.initialRowField,
      colField: this.props.initialColField,

      sort1: "none",
      direction1: "ascending",
      sort2: "none",
      direction2: "ascending",
      filters: {},
      colWidths: {},
    }
  },

  updateFilter: function(col, filters) {
    var oldFilters = this.state.filters;
    oldFilters[col] = filters;
    this.setState({filters: oldFilters});
  },

  changeMeasurementType: function(type) {
    this.setState({measurementType: type});
  },
  changeMeasurement: function(measurement) {
    this.setState({measurement: measurement});
  },
  changeRowField: function(field) {
    this.setState({rowField: field});
  },
  changeColField: function(field) {
    this.setState({colField: field});
  },

  render: function() {
    var props = this.props;
    var state = this.state;
    var data = props.data;

    var dataRows = _.groupBy(props.data, state.rowField);
    var rowGroups = _.uniq(_.pluck(props.data,state.rowField));
    var colGroups = _.uniq(_.pluck(props.data,state.colField));

    var colWidth = (props.width/(colGroups.length+2))-6;
    var cellHeight = 50;

    var allGroups = rowGroups.map(function(row,i) {
      var rowData = _.groupBy(dataRows[row],state.colField);
      return(rowData);
    },this);

    allGroups.map(function(row,i) {
      colGroups.map(function(colKey,i) {
        if(!(colKey in row)) {
          row[colKey] = {data: null, value: 0};
        }
        else {
          var cellData = row[colKey];
          var values = row[colKey].map(function(cell,i) {
            return(cell[state.measurement]);
          },this);
          if(state.measurementType == "Average") {
            var cellValue = Math.round(100* (d3.sum(values)/values.length)) /100;
          }
          else if(state.measurementType == "Sum") {
            var cellValue = d3.sum(values);
          }
          else if(state.measurementType == "Count") {
            var cellValue = values.length;
          }
          row[colKey] = {data: row[colKey], value: cellValue};
        }
      },this)
    },this);

    var headerCells = colGroups.map(function(col,i) {
      return(<HeaderCell data={col} width={colWidth} height={cellHeight} key={i}/>)
    });
    headerCells.push(<HeaderCell data={"Total"} width={colWidth} height={cellHeight} key={"total-h"} />);

    var colTotals = [];
    colGroups.map(function(col,j) {
      colTotals.push(0);
    })

    var allRows = allGroups.map(function(row,i) {
      var rowTotal = 0;
      var cells = colGroups.map(function(col,j) {
        rowTotal += row[col]["value"];
        colTotals[j] += row[col]["value"];
        return(<Cell data={row[col]["value"]} width={colWidth+5} height={cellHeight} key={i +'-'+j} />)
      });
      if(state.measurementType == "Average") {
        var rowTotalValue =  Math.round(100* (rowTotal/colGroups.length)) / 100;
      }
      else {
        var rowTotalValue = rowTotal;
      }
      cells.push(<Cell data={rowTotalValue} width={colWidth+5} height={cellHeight} key={i + "-rowTotal"} />);
      return(<Row data={row} width={props.width} height={cellHeight} key={i} number={i} >
        <Cell data={rowGroups[i]} width={colWidth+5} height={cellHeight} key={i+"-head"} />
        {cells} </Row>)
    });

    var grandTotal = 0;
    var totalCells = colTotals.map(function(total,i) {
      grandTotal += total;
      if(state.measurementType == "Average") {
        var colTotalValue =  Math.round(100* (total/rowGroups.length)) /100;
      }
      else {
        var colTotalValue = total;
      }
      return(<HeaderCell data={colTotalValue} width={colWidth} height={cellHeight} key={i+"-colTotal"} />)
    });
    if(state.measurementType == "Average") {
      var grandTotalValue =  Math.round(100* (grandTotal / (rowGroups.length*colGroups.length))) /100;
    }
    else {
      var grandTotalValue = grandTotal;
    }
    totalCells.push(<HeaderCell data={grandTotalValue} width={colWidth} height={cellHeight} key={"grandTotal"} />);
    allRows.push(<HeaderRow data={colTotals} width={props.width} height={cellHeight} key={"colTotals"} >
      <HeaderCell data={"Total"} width={colWidth} height={cellHeight} key={"colTotalsHead"} />
        {totalCells} </HeaderRow>);

    // Height of the data rows
    var dataRowsHeight = (props.height/2) - cellHeight - cellHeight;

// filterCategories={colGroups} filterFunction={this.updateFilter}
    return(
      <div style={{width: props.width+20, float: 'left'}}>
        <HeaderRow width={props.width} height={cellHeight}>
          <OptionCell width={colWidth} height={cellHeight} data={state.measurementType} options={["Average","Sum","Count"]}
            changeOption={this.changeMeasurementType} filterCategories={"null"} />
          <OptionCell width={colWidth} height={cellHeight} data={state.measurement} options={props.measurementOptions}
            changeOption={this.changeMeasurement}  filterCategories={"null"} />
        </HeaderRow>
        <HeaderRow width={props.width} height={cellHeight}>
          <HeaderCell data={""} width={colWidth} height={cellHeight} />
          <OptionCell width={colWidth} height={cellHeight} data={state.colField} options={props.fieldOptions}
            changeOption={this.changeColField}  filterCategories={"null"} />
        </HeaderRow>
        <HeaderRow width={props.width} height={cellHeight}>
          <OptionCell width={colWidth} height={cellHeight} data={state.rowField} options={props.fieldOptions}
            changeOption={this.changeRowField}  filterCategories={"null"} />
          {headerCells}
        </HeaderRow>
        <div style={{maxHeight: dataRowsHeight, width: props.width+20, overflowY: 'scroll', borderBottom: '1px solid black', margin: '0px'}}>
          <div style={{maxHeight: dataRowsHeight, margin: '0px'}}>
            {allRows}
          </div>
        </div>
        <PivotChart data={allGroups} height={props.height/2} width={props.width} rowField={state.rowField} rowGroups={rowGroups}
          colField={state.colField} colGroups={colGroups} measurement={state.measurement} measurementType={state.measurementType}/>
      </div>
      )
    }
});

module.exports = PivotSeries;
