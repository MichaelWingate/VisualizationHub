var React = require('react');
var ReactDOM = require('react-dom');

/* Creates a cell for a table header. Props:
      data: Title displayed for the column
      reference: object reference name for the column
      width: pixel width of cell
      height: pixel height of cell
      number: column index
      resize: function to call when the resize event is dragging
      isSorting: whether this column is currently used for a sort. True/false
      direction: direction of sort. Ascending, descending, or "" for no sort
      primarySort: whether this is the primary sort or not. True/false
      sortFunction: function to call for sort
      filterCategories: array of unique values of the column used to filter
      filterFunction: function to call to filter
*/
var HeaderCell = React.createClass({
  getInitialState: function() {
    /*
      displayFilter: true/false based off of whether the filter panel is displayed or not
      filterOptions: object of filter options. Pairs each option with true/false for
        whether they are included or filtered out
      resizing: true/false based off of whether the column is actively resizing or not
      startDrag: used to calculate the distance the mouse has dragged the column
      hover: true/false for whether the mouse is hovering over the cell
    */
    return {
      displayFilter: false,
      filterOptions: {},
      resizing: false,
      startDrag: 0,
      hover: false,
    }
  },

  // Takes the provided filter categories and puts them into an object with
  // true/false values for filtering. Also adds the "Select All" option.
  /*componentWillMount: function() {
    var filterArray = {all: true};
    this.props.filterCategories.map(function(category,i) {
      filterArray[category] = true;
    })
    this.setState({filterOptions: filterArray});
  },

  // Sends information to sort the column
  sort: function() {
    this.props.sortFunction(this.props.reference,this.props.direction);
  },

  // Opens or closes the filter panel
  filterToggle: function(e) {
    this.stopPropagation(e);
    this.setState({displayFilter: !this.state.displayFilter});
  },

  // Updates the filter options based off of a checkbox click
  // and sends the information back to filter the data.
  filterData: function(e) {
    var clicked = e.currentTarget.value;
    var oldFilter = this.state.filterOptions;

    if(clicked == "all") {
      if(this.state.filterOptions["all"]) {
        Object.keys(oldFilter).forEach(function(key) {
          oldFilter[key] = false;
        })
      }
      else{
        Object.keys(oldFilter).forEach(function(key) {
          oldFilter[key] = true;
        })
      }
    }
    else {
      oldFilter[clicked] = !oldFilter[clicked];
    }
    this.setState({filterOptions: oldFilter});
    this.props.filterFunction(this.props.reference,oldFilter);
  },

  // Begins a column resize event
  startDrag: function(e) {
    this.stopPropagation(e);
    this.setState({resizing: true, startDrag: e.clientX});
  },

  // Ends a column resize event
  endDrag: function(e) {
    this.stopPropagation(e);
    this.setState({resizing: false});
  },

  // Calculates how much the column has been dragged and calls the function
  // to resize the columns.
  drag: function(e) {
    if(this.state.resizing) {
      var xChange = e.clientX - this.state.startDrag;
      this.props.resize(this.props.number, xChange);
      this.setState({startDrag: this.state.startDrag + xChange});
    }
  },

  // Toggles mouse hover
  hover: function() {
    this.setState({hover: true});
  },

  // Controls overlapping div mouse events
  stopPropagation: function(e) {
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
  },*/

  render: function() {
    var props = this.props;

    // Sets the proper icon for sorting
    /*
    if(this.props.isSorting) {
      if(this.props.primarySort) {
        if(this.props.direction == "ascending") {
          var icon = "fa fa-arrow-down fa-lg";
        }
        else {
          var icon = "fa fa-arrow-up fa-lg";
        }
      }
      else{
        if(this.props.direction == "ascending") {
          var icon = "fa fa-arrow-down";
        }
        else {
          var icon = "fa fa-arrow-up";
        }
      }
    }

    // Creates checkboxes for the filter options
    var filters = [];
    filters.push(<div key={0}><input type="checkbox" name={"(Select All)"} value={"all"} checked={this.state.filterOptions["all"]} onChange={this.filterData}/>(Select All) <br/></div>);
    props.filterCategories.map(function(category,i) {
      filters.push(<div key={i+1}><input type="checkbox" name={props.data} value={category} checked={this.state.filterOptions[category]} onChange={this.filterData}/>{category} <br/></div>)
    },this);

    // Sets the cursor depending on hover
    if(this.state.hover) {
        var cursorStyle= {cursor: 'pointer', height: '100%'};
    }
    else{
      var cursorStyle={cursor: 'auto', height: '100%'};
    }*/

    /*
    <div style={cursorStyle} onMouseOver={this.hover} onClick={this.sort}><h1 style={{margin: '0px', position: 'absolute', top: '50%', transform: 'translate(0,-50%)', left: 5}}>{props.data}{this.props.isSorting ? <i className={icon} style={{float: 'left'}} aria-hidden="true" /> : null}</h1>
    <i  style={{position: 'absolute', top: '50%', transform: 'translate(0,-50%)', right: 5}} className="fa fa-filter fa-2x" aria-hidden="true" onClick={this.filterToggle}></i></div>
  {this.state.displayFilter ? <div style={{position: 'absolute',zIndex: 2, top: props.height*3/4, right: props.width/6, border: '1px solid black', backgroundColor: 'gray'}} onClick={this.stopPropagation}>{filters}</div> : null}
  <div className="drag" style={{position: 'absolute', right: -2.5, bottom: 0, width: '5px', height: props.height, cursor: 'w-resize'}} onMouseDown={this.startDrag} />
  */
    return(
      <div style={{width: props.width, height: props.height, position: 'relative', float: 'left', borderRight: '1px solid black', backgroundImage: 'linear-gradient(#fff,#efefef)', paddingLeft: 5}} >
        <h2 style={{margin: '0px', position: 'absolute', top: '50%', transform: 'translate(0,-50%)', left: 5}}>{props.data}</h2>
      </div>
    )
  }
});


module.exports = HeaderCell;
