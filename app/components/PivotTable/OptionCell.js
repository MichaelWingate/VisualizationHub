var React = require('react');
var ReactDOM = require('react-dom');
/*
  IN PROGRESS: coding to allow filtering options as well
*/
var OptionCell = React.createClass({
  getInitialState: function() {
    return{
      options: false,
      filters: false,
      filterOptions: {},
      data: null,
    }
  },

  componentWillMount: function() {
    if(this.props.filterCategories != "null") {
      var filterArray = {all: true};
      this.props.filterCategories.map(function(category,i) {
        filterArray[category] = true;
      })
      this.setState({filterOptions: filterArray});
    }
    this.setState({data: this.props.data});
  },
  componentDidUpdate: function(newProps) {
    if(newProps.data != this.state.data) {
      if(this.props.filterCategories != "null") {
        var filterArray = {all: true};
        this.props.filterCategories.map(function(category,i) {
          filterArray[category] = true;
        })
        this.setState({filterOptions: filterArray});
      }
      this.setState({data: this.props.data});
    }
  },

  filterToggle: function(e) {
    this.stopPropagation(e);
    this.setState({filters: !this.state.filters});
  },

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
    this.props.filterFunction(this.props.data,oldFilter);
  },

  optionsToggle: function() {
    this.setState({options: !this.state.options});
  },
  optionClick: function(e) {
    this.props.changeOption(e.currentTarget.value);
    this.setState({options: false});
  },
  // Controls overlapping div mouse events
  stopPropagation: function(e) {
    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
  },
  render: function() {
    var props = this.props;

    var options = [];
    props.options.map(function(option,i) {
      options.push(<div key={i}><input type="radio" name={props.data} value={option} checked={option == props.data} onChange={this.optionClick} />{option}</div>)
    },this)

    if(props.filterCategories != "null") {
      var filters = [];
      filters.push(<div key={0}><input type="checkbox" name={"(Select All)"} value={"all"} checked={this.state.filterOptions["all"]} onChange={this.filterData}/>(Select All) <br/></div>);
      props.filterCategories.map(function(category,i) {
        filters.push(<div key={i+1}><input type="checkbox" name={props.data} value={category} checked={this.state.filterOptions[category]} onChange={this.filterData}/>{category}<br/></div>);
      },this);
    }

    return(
      <div style={{width: props.width, height: props.height, position: 'relative', float: 'left', borderRight: '1px solid black', backgroundImage: 'linear-gradient(#fff,#efefef)', paddingLeft: 5}} >
        <h2 style={{margin: '0px', position: 'absolute', top: '50%', transform: 'translate(0,-50%)', left: 5}}>{props.data}</h2>
          {props.filterCategories != "null" ? <i  style={{position: 'absolute', top: '50%', transform: 'translate(0,-50%)', right: 30}} className="fa fa-filter fa-2x" aria-hidden="true" onClick={this.filterToggle}></i> : null}
          {this.state.filters ? <div style={{position: 'absolute', zIndex: 2, top: props.height*3/4, right: props.width/6, border: '1px solid black', backgroundColor: 'gray'}} onClick={this.stopPropagation}> {filters} </div> : null}
          <i  style={{position: 'absolute', top: '50%', transform: 'translate(0,-50%)', right: 5}} className="fa fa-arrow-down fa-2x" aria-hidden="true" onClick={this.optionsToggle}></i>
          {this.state.options ? <div style={{position: 'absolute',zIndex: 2, top: props.height*3/4, right: props.width/6, border: '1px solid black', backgroundColor: 'gray'}} onClick={this.stopPropagation}>{options}</div> : null}
      </div>
    )
  }
});

module.exports = OptionCell;
