var query = 'http://data.nasa.gov/api/get_tag_datasets/?slug=apollo&slug=imagery&count=1';
var slugs = {};
$(document).ready(function(){
  var getData = function(query){
    $.ajax({
      url: query,
      type: 'GET',
      dataType: 'jsonp',
      success: function(data){
        filterData(data.posts['0']);
      }
    });
  };

  var filterData = function(post){
    var resultsObj = {};
    resultsObj.tags = [];
    var recursiveFilter = function(info){
      for(var point in info){
        if(info[point] !== ''){
          if(typeof info[point] !== 'object' && info[point] !== ''){
            if(point === 'content' || point === 'date' || point === 'modified' || point === 'id'){
              resultsObj[point] = info[point];
            } else if (point === 'title' && resultsObj.title===undefined){
              resultsObj.title = info[point];
            } else if(point === 'slug'){
              resultsObj.tags.push(info[point]);
            }
          } else if(point === 'more_info_link') {
            resultsObj.source = info[point][0];
          } else {
            recursiveFilter(info[point]);
          }
        }
      }
    };
    recursiveFilter(post);
    slugBuilder(resultsObj);
    displayData(resultsObj);
  };

  var slugBuilder = function(results){
    for(var i = 0; i < results.tags.length; i++){
      if(slugs[results.tags[i]] === undefined){
        slugs[results.tags[i]] = [];
      }
      slugs[results.tags[i]].push(results.id);
    }
    console.log(slugs);
  }
  var displayData = function(results){
    var $el;
    for(var item in results){
      if(item === 'content'){
        $el = results[item];
      } else if (item === 'title'){
        $el = $('<h3 class="title"></h3>').text(results[item]);
      } else if (item === 'source'){
        $el = $('<a href='+results[item]+'></a>');
        $el.text(results[item]);
      } else if (item !== 'tags'){
        $el = $('<p></p>').text(item+': '+results[item]);
      }
      $('.container').append($el);
    }
  };


  $('button').on('click', function(){
    getData(query);
  });
});