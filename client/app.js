var query = 'http://data.nasa.gov/api/get_recent_datasets?count=100';
var slugs;
var app = angular.module("spaceLinks", []);

app.controller('presentPosts', function($scope){

  $scope.ids = [];
  slugs = { '':$scope.ids, 'all': $scope.ids };
  $scope.dataPosts = {};

  $scope.getData = function(query){
    $.ajax({
      url: query,
      type: 'GET',
      dataType: 'jsonp',
      success: function(data){
        filterData(data.posts);
      }
    });
  };

  // var postToServer = function(info){
  //   $.ajax({
  //     url: "127.0.0.1:3000/clicks",
  //     type: 'POST',
  //     success: function(data){
  //       retrieveFromServer(data);
  //     }
  //   });
  // };

  // var retrieveFromServer = function(info){
  //   $.ajax({
  //     url: "127.0.0.1:3000/clicks",
  //     type: 'GET',
  //     success: function(data){

  //     }
  //   })
  // }

  var filterData = function(posts){
    for(var i = 0; i < posts.length; i++){
      filterPost(posts[i]);
    }
    $scope.listenForTitleClick();
  }

  var filterPost = function(post){
    var resultsObj = {};
    resultsObj.tags = [];
    var recursiveFilter = function(info){
      for(var point in info){
        if(info[point] !== ''){
          if(typeof info[point] !== 'object' && info[point] !== ''){
            if(point === 'content' || point === 'date' || point === 'modified'){
              resultsObj[point] = info[point];
            } else if (point === 'title' && resultsObj.title===undefined){
              resultsObj.title = info[point];
            } else if(point === 'slug'){
              resultsObj.tags.push(info[point]);
            } else if(point === 'id'){
              resultsObj.srcId = info[point];
            } else if(point === 'url'){
              resultsObj.url = info[point];
            }
          } else if(point === 'more_info_link') {
            resultsObj.source = info[point][0];
          } else {
            recursiveFilter(info[point]);
          }
        }
      }
    };
    if($scope.ids.length === 0){
      resultsObj.id = 1;
    } else {
      resultsObj.id = $scope.ids[$scope.ids.length-1] + 1;
    }
    $scope.ids.push(resultsObj.id);
    $scope.dataPosts[resultsObj.id] = resultsObj;
    recursiveFilter(post);
    slugBuilder(resultsObj);
    displayPost(resultsObj);
  };

  var slugBuilder = function(results){
    for(var i = 0; i < results.tags.length; i++){
      if(slugs[results.tags[i]] === undefined){
        slugs[results.tags[i]] = [];
      }
      slugs[results.tags[i]].push(results.id);
    }
  }

  var displaySlugs = function(){
    $('.container').empty();
    var keyList = Object.keys(slugs).sort();
    for(var i = 0; i < keyList.length; i++){
      $span = angular.element('<ul></ul>').text(keyList[i]);
      angular.element('.container').append($span);
    }
    angular.element('.container').on('click', 'ul', function(){
      var tag = angular.element(this).text();
      var posts = slugs[tag];
      console.log(posts);
      angular.element('.container').empty();
      for(var i = 0; i < posts.length; i++){
        console.log(posts[i]);
        var item = $scope.dataPosts[posts[i]];
        displayPost(item);
      }
    });
  };

  var displayPost = function(results){
    var $post = angular.element('<div class="post"></div>').append('</br>');
    var $el;
    if(results.source === undefined){
      results.source = results.url;
    }
    for(var item in results){
      if(item === 'content'){
        $el = results[item];
      } else if (item === 'title'){
        $el = angular.element('<h3 class='+results.id+'></h3>');
        $el.text(results[item]);
      } else if (item === 'source'){
        $el = angular.element('<a href='+results[item]+'></a>');
        $el.text(results[item]);
      } else if (item !== 'tags' && item !== 'srcId' && item !== 'id' && item !== 'url'){
        $el = angular.element('<p></p>').text(item+': '+results[item]);
      }
      $post.append($el);
    }
    angular.element('.container').append($post);
  
  };

  angular.element('button').on('click', function(){
    var tag = angular.element(this).text();
    if(tag === 'tags'){
      displaySlugs();
    } else {
    $scope.key = tag;
    $scope.onSearch();
    }
  });

  $scope.listenForTitleClick = function(){
    angular.element('.container').on('click', 'h3', function(){
    var titleId = angular.element(this).attr('class');
    $scope.showSinglePost(titleId);
    })
  };
  
  $scope.showSinglePost = function(titleId){
    var clickedPost = $scope.dataPosts[titleId];
    angular.element('.container').empty();
    if(clickedPost.clicks === undefined){
      clickedPost.clicks = 1;
    } else {
      clickedPost.clicks++;
    }
    displayPost(clickedPost);
    // $.ajax({
    //   type: "POST",
    //   url: "127.0.0.1:3000/clicks",
    //   data: { "clicks":clickedPost.clicks,
    //           "id": titleId },
    //   success: function(){
    //     console.log(clickedPost.clicks);
    //   }
    // });
  };
  
  $scope.onSearch = function(){
    var tag = slugs[$scope.key];
    angular.element('.container').empty();
    if(!!tag){
      for(var i = 0; i < tag.length; i++){
        displayPost($scope.dataPosts[slugs[$scope.key][i]]);
      }
    }
  };

  $scope.getData(query);

});
