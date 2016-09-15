var React = require('react');
var ReactDOM = require('react-dom');
var d3 = require('d3');
var Row = require('./Row');
var Cell = require('./Cell');
var HeaderCell = require('./HeaderCell');
var HeaderRow = require('./HeaderRow');
var _ = require('underscore');

//Orgainzes data and creates headers and rows
var TableSeries = React.createClass({
  /*sort1: reference for the primary sort
    direction1: direction of the primary sort (ascending or descending)
    sort2: reference for the secondary sort
    direction2: direction of the secondary sort
    filters:  object for filtering columns. key should be the column ref, and
      value should be an object containing a key for each unique entry of that column
      and true or false of whether it should be displayed or filtered out.
    colWidths: object for column widths. Key is index of column, value is pixel
      width of the column.
  */
  getInitialState: function() {
    return {
      sort1: "none",
      direction1: "ascending",
      sort2: "none",
      direction2: "ascending",
      filters: {},
      colWidths: {},
    }
  },

  // Sets the default column widths
  componentWillMount: function() {
    var numCols = this.props.colRefs.length;
    var defaultWidth = (this.props.width/numCols);

    var colWidths = {};
    this.props.colRefs.map(function(col,i) {
      colWidths[i] = defaultWidth;
    })
    this.setState({colWidths: colWidths});
  },

  // When the mouse moves in the table, this calls a function in each header cell.
  // This is used for resizing when a resize event has already started.
  onMouseMove: function(e) {
    e.preventDefault();
    this.props.colRefs.map(function(col,i) {
      this.refs[i].drag(e);
    },this)
  },

  // When the mouse button is released, this calls a function in each header cell.
  // The event stops a resize event.
  // NOTE: these mouse events are here because the resize mouse movements would
  //       take the mouse out of the header cell.
  onMouseUp: function(e) {
    this.props.colRefs.map(function(col,i) {
      this.refs[i].endDrag(e);
    },this)
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
  },

  // Sets the primary and secondary sort references, and primary and secondary
  // sort directions based off of a header cell click.
  sort: function(reference) {
    if(reference == this.state.sort1) {
      if(this.state.direction1 == "ascending") {
        this.setState({direction1: "descending"});
      }
      else{
        this.setState({direction1: "ascending"});
      }
    }
    else{
      var oldSort = this.state.sort1;
      var oldDirection = this.state.direction1;
      this.setState({sort1: reference, sort2: oldSort, direction2: oldDirection});
    }
  },

  // Updates the filters variable with the column and field data. (this will
  // be called from the header cell components).
  updateFilter: function(col, filters) {
    var oldFilters = this.state.filters;
    oldFilters[col] = filters;
    this.setState({filters: oldFilters});
  },

  // Filters specified data. Uses the filters state variable.
  filter: function(data, refs) {
    var filteredData = [];
    data.map(function(value,i){
      var filteredOut = false;
      refs.map(function(column,j) {
        if(this.state.filters[column] != null) {
          if(!this.state.filters[column][value[column]]) {
            filteredOut = true;
          }
        }
      },this)
      if(!filteredOut) {
        filteredData.push(value);
      }
    },this);
    return(filteredData);
  },

  // Increases or decreases a column's width based off of a mouse drag. The corresponding
  // width is then added or subtracted from the column to the right.
  resizeCol: function(number,xChange) {
    var colWidths = this.state.colWidths;
    if(colWidths[number] + xChange >= 50 && colWidths[number+1] - xChange >= 50) {
      colWidths[number] += xChange;
      colWidths[number+1] += -xChange;
      this.setState({colWidths: colWidths});
    }
  },
  render: function() {
    var props = this.props;
    var data = props.data;

    // If a primary sort was set, sort the data
    if(this.state.sort1 != "none") {
      data.sort(multiSort(this.state.sort1,this.state.direction1,this.state.sort2,this.state.direction2, props.colRefs[0]));
    }

    // Gets an array of unique values for each column. Used for the filtering
    var filterList = props.colRefs.map(function(col,i) {
      return(_.uniq(_.pluck(data,col)))
    });

    // Makes calculatons for the header, and makes the header cells
    var cellHeight = 50;
    var headerCells = props.colNames.map(function(title,j) {
      // Determine if and how this column is being sorted
      var isSorting = false;
      var primarySort = false;
      var sortDirection = "";
      if(props.colRefs[j] == this.state.sort1) {isSorting = true; primarySort = true; sortDirection = this.state.direction1}
      if(props.colRefs[j] == this.state.sort2) {isSorting = true; primarySort = false; sortDirection = this.state.direction2}
      return(<HeaderCell data={title} reference={props.colRefs[j]} width={this.state.colWidths[j]-6} height={cellHeight} key={j} number={j} resize={this.resizeCol}
                direction={sortDirection} primarySort={primarySort} sortFunction={this.sort} isSorting={isSorting}
                filterCategories={filterList[j]} filterFunction={this.updateFilter} ref={j} />)
    },this);

    // Sets up the color shade and/or background bar style options
    var styleScales = {};
    props.colRefs.map(function(col,i) {
      var styleIndex = props.styleRefs.indexOf(col);
      if(styleIndex != -1) {
        var min = d3.min(data, function(value) {return value[col];});
        var max = d3.max(data, function(value) {return value[col];});

        if(props.cellStyle[styleIndex] == "shade") {
          var colorScale = d3.scaleLinear()
            .domain([min,min+((max-min)/2),max])
            .range(["green","yellow","red"]);
            styleScales[styleIndex] = colorScale;
        }
        else if(props.cellStyle[styleIndex] == "bar") {
          var barScale = d3.scaleLinear()
              .domain([min,max])
              .range([0,this.state.colWidths[i]-1]);
          styleScales[styleIndex] = barScale;
        }
      }
    },this)

    // Filters data if filter options were specified
    var filteredData = this.filter(data,props.colRefs);

    // Creates the rows and cells for all of the data
    var allRows = filteredData.map(function(row,i) {
      var cells = props.colRefs.map(function(cell,j) {
        // Cell Style
        var cellColor = "transparent";
        var barWidth = 0;
        var styleIndex = props.styleRefs.indexOf(cell);
        if(styleIndex != -1) {
          if(props.cellStyle[styleIndex] == "shade") {
            cellColor = styleScales[styleIndex](row[cell]);
          }
          if(props.cellStyle[styleIndex] == "bar") {
            var barWidth = styleScales[styleIndex](row[cell]);
          }
        }
        return(<Cell data={row[cell]} width={this.state.colWidths[j]-1} height={cellHeight} color={cellColor} key={i+'-'+j} barWidth={barWidth} />)
      },this);
      return(<Row data={row} width={props.width} height={cellHeight} key={row[props.colRefs[0]]} number={i} selectPoint={props.selectPoint} >{cells}</Row>)
    },this);

    // Height of the data rows
    var dataRowsHeight = props.height - cellHeight;
    return(
      <div onMouseMove={this.onMouseMove} onMouseUp={this.onMouseUp} style={{width: props.width+20, float: 'left'}}>
        <HeaderRow width={props.width} height={cellHeight}>
          {headerCells}
        </HeaderRow>
      <div style={{maxHeight: dataRowsHeight, width: props.width+20, overflowY: 'scroll', borderBottom: '1px solid black', margin: '0px'}}>
      <div style={{maxHeight: dataRowsHeight, margin: '0px'}}>
        {allRows}
      </div>
      </div>
      </div>
    )
  }
});

// Returns a sort function to compare rows based off of two references and corresponding directions.
// Accounts for dates if the ref is "Date" and in "%m-%d-%y" format.
// If there is a tie, it's decided by ID to prevent weird order changes.
function multiSort(ref1,direction1,ref2,direction2,idRef) {
  var props = {ref1: ref1, direction1: direction1, ref2: ref2, direction2: direction2, idRef: idRef};
  return function(a,b) {
    var dateParse = d3.timeParse("%m-%d-%y");
    var aComp1 = a[props.ref1];
    var bComp1 = b[props.ref1];
    if(props.ref1=="Date") {
      aComp1 = dateParse(a[props.ref1]);
      bComp1 = dateParse(b[props.ref1]);
    }
    if(aComp1 > bComp1) {
      if(props.direction1 == "ascending") {return 1;}
      else {return -1;}
    }
    else if(aComp1 < bComp1){
      if(props.direction1 == "ascending") {return -1;}
      else {return 1;}
    }
    else {
      if(props.ref2 == "none") {
        var aComp2 = a[props.idRef];
        var bComp2 = b[props.idRef];
        if(aComp2 > bComp2) {
          return 1;
        }
        else {
          return -1;
        }
      }
      else{
        var aComp2 = a[props.ref2];
        var bComp2 = b[props.ref2];
        if(props.ref2=="Date") {
          aComp2 = dateParse(a[props.ref2]);
          bComp2 = dateParse(b[props.ref2]);
        }
        if(aComp2 > bComp2) {
          if(props.direction2 == "ascending") {return 1;}
          else {return -1;}
        }
        else if(aComp2 < bComp2){
          if(props.direction2 == "ascending") {return -1;}
          else {return 1;}
        }
        else{
          var aComp3 = a[props.idRef];
          var bComp3 = b[props.idRef];
          if(aComp3 > bComp3) {
            return 1;
          }
          else {
            return -1;
          }
        }
      }
    }
  }
}

module.exports = TableSeries;
