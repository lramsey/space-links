var query = 'http://data.nasa.gov/api/get_tag_datasets/?slug=apollo&slug=imagery&count=1';

$(document).ready(function(){
  var getData = function(query){
    .ajax({
      url: query,
      type: 'GET',
      dataType: 'jsonp',
      success: function(data){
        console.log(data);
      }
    }
  }
  $('button').on('click', getData(query)
});