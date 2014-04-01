var app = angular.module("spaceLinks", []);

app.controller('presentPosts', function($scope){

  $scope.initialize = function(){
    $scope.ids = [];
    $scope.slugs = { 'all': $scope.ids };
    $scope.query = 'http://data.nasa.gov/api/get_recent_datasets?count=100';
    $scope.dataPosts = {};
    $scope.key = 'all';
    $scope.getData($scope.query);
  };

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

  var filterData = function(posts){
    for(var i = 0; i < posts.length; i++){
      filterPost(posts[i]);
    }
    $scope.listenForTitleClick();
  };

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
      if($scope.slugs[results.tags[i]] === undefined){
        $scope.slugs[results.tags[i]] = [];
      }
      $scope.slugs[results.tags[i]].push(results.id);
    }
  };

  var displaySlugs = function(){
    angular.element('.container').empty();
    var keyList = Object.keys($scope.slugs).sort();
    angular.element('.container').append('<div class="col1"></div>');
    angular.element('.container').append('<div class ="col2"></div>');
    angular.element('.container').append('<div class= "col3"></div>');
    for(var i = 0; i < keyList.length; i++){
      $span = angular.element('<ul></ul>').text(keyList[i]);
      if(i%3 === 0){
        angular.element('.col3').append($span);
      } else if (i%2 === 0){
        angular.element('.col2').append($span);
      } else {
        angular.element('.col1').append($span);
      }
    }
    angular.element('.container').on('click', 'ul', function(){
      var tag = angular.element(this).text();
      var posts = $scope.slugs[tag];
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
    results.source = results.source || results.url;
    results.clicks = results.clicks || 0;
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

  $scope.buttonClick = function(input){
    if(input === 'tags'){
      displaySlugs();
    } else if (input === 'random' || input === 'shuffle' || input === 'rank'){
      $scope.key = $scope.key || 'all';
      var selectedPostIds = $scope.slugs[$scope.key];
      angular.element('.container').empty();
      if(input === 'random'){
        var index = Math.floor(Math.random()*selectedPostIds.length);
        displayPost($scope.dataPosts[selectedPostIds[index]]);
      } else if(input === 'shuffle'){
        shuffleDeck(selectedPostIds);
        for(var i = 0; i < selectedPostIds.length; i++){
          displayPost($scope.dataPosts[selectedPostIds[i]]);
        }
      } else if (input ==='rank'){
        var selectedPosts = [];
        for(var j = 0; j < selectedPostIds.length; j++){
          selectedPosts.push($scope.dataPosts[selectedPostIds[j]]);
        }
        selectedPosts.sort(function(a, b){
          return b.clicks-a.clicks;
        });
        for(var k = 0; k < selectedPosts.length; k++){
          displayPost(selectedPosts[k]);
        }
      }
    } else {
    $scope.key = input;
    $scope.onSearch();
    }
  };

  $scope.listenForTitleClick = function(){
    angular.element('.container').on('click', 'h3', function(){
    var titleId = angular.element(this).attr('class');
    $scope.showSinglePost(titleId);
    });
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
  };
  
  $scope.onSearch = function(){
    $scope.key = $scope.key || 'all';
    var tag = $scope.slugs[$scope.key];
    angular.element('.container').empty();
    if(!!tag){
      for(var i = 0; i < tag.length; i++){
        displayPost($scope.dataPosts[$scope.slugs[$scope.key][i]]);
      }
    }
  };

  var shuffleDeck = function(deck) {
    for(var j = 0; j < deck.length; j++){
      cardIndex = Math.floor(Math.random()*(deck.length-j));
      var lastCard = deck[deck.length-1 - j];
      deck[deck.length-1 - j] = deck[cardIndex];
      deck[cardIndex] = lastCard;
    }
  };

  $scope.initialize();
  
});
