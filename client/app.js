/* ------------------------------------------------------------------------------------*/
/* ANGULAR SET UP & INIT
/* ------------------------------------------------------------------------------------*/

var app = angular.module("spaceLinks", []);

app.controller('presentPosts', function($scope){

  $scope.initialize = function(){
    $scope.ids = [];
    $scope.slugs = { 'all': $scope.ids, '': $scope.ids };
    $scope.query = 'http://data.nasa.gov/api/get_recent_datasets?count=100';
    $scope.dataPosts = {};
    $scope.key = '';
    $scope.getNasaData($scope.query);
  };

/* ------------------------------------------------------------------------------------*/
/* AJAX
/* ------------------------------------------------------------------------------------*/

  $scope.getNasaData = function(query){
    $.ajax({
      url: query,
      type: 'GET',
      dataType: 'jsonp',
      success: function(data){
        filterPosts(data.posts);
      }
    });
  };

  var postServerData = function(posts){
    $.ajax({
      url:'/clicks',
      type: 'POST',
      data: posts,
      success: function(data){
        var parsedData = JSON.parse(data);
        $scope.dataPosts = parsedData;
        displayPosts(parsedData);
        $scope.listenForTitleClick();
      }
    });
  };

  var postNewClick = function(post){
    console.log('logging click in the server: ', post);
    $.ajax({
      url:'/newClick',
      type: 'POST',
      data: post,
      success: function(data){
        var parsedData = JSON.parse(data);
        for(var key in parsedData){
          $scope.dataPosts[key] = parsedData[key];
        }
        displayPosts(parsedData);
      }
    });
  };

/* ------------------------------------------------------------------------------------*/
/* DATA FILTERING
/* ------------------------------------------------------------------------------------*/

  var filterPosts = function(posts){
    for(var i = 0; i < posts.length; i++){
      var resultsObj = {};
      resultsObj.tags = [];
      if($scope.ids.length === 0){
        resultsObj.id = 1;
      } else {
        resultsObj.id = $scope.ids[$scope.ids.length-1] + 1;
      }
      $scope.ids.push(resultsObj.id);
      $scope.dataPosts[resultsObj.id] = resultsObj;
      recursiveFilter(posts[i], resultsObj);
      slugBuilder(resultsObj);
    }
    postServerData($scope.dataPosts);
  };

  var recursiveFilter = function(info, resultsObj){
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
          } else if (point === 'clicks'){
            resultsObj.clicks = info[point];
          }
        } else if(point === 'more_info_link') {
          resultsObj.source = info[point][0];
        } else {
          recursiveFilter(info[point], resultsObj);
        }
      }
    }
  };

  var slugBuilder = function(results){
    for(var i = 0; i < results.tags.length; i++){
      if($scope.slugs[results.tags[i]] === undefined){
        $scope.slugs[results.tags[i]] = [];
      }
      $scope.slugs[results.tags[i]].push(results.id);
    }
  };

/* ------------------------------------------------------------------------------------*/
/*  DISPLAY DATA
/* ------------------------------------------------------------------------------------*/

  var displayPosts = function(posts){
    for(var item in posts){
      displayPost(posts[item]);
    }
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


  var displaySlugs = function(){
    slugSetUp();
    var keyList = Object.keys($scope.slugs).sort();
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
    slugListener();
  };

  var slugSetUp = function(){
    angular.element('.container').empty();
    angular.element('.container').append('<div class="col1"></div>');
    angular.element('.container').append('<div class ="col2"></div>');
    angular.element('.container').append('<div class= "col3"></div>');
  };



/* ------------------------------------------------------------------------------------*/
/* BUTTON CLICK
/* ------------------------------------------------------------------------------------*/

  $scope.buttonClick = function(input){
    if(input === 'tags'){
      displaySlugs();
    } else if (input === 'random' || input === 'shuffle' || input === 'rank'){
      var selectedPostIds = $scope.slugs[$scope.key];
      angular.element('.container').empty();
      if(input === 'random'){
        showRandom(selectedPostIds);
      } else if(input === 'shuffle'){
        showShuffle(selectedPostIds);
      } else if (input ==='rank'){
        showRank(selectedPostIds);
      }
    } else {
    $scope.key = input;
    $scope.onSearch();
    }
  };

  var showRandom = function(postIds){
    var index = Math.floor(Math.random()*postIds.length);
    displayPost($scope.dataPosts[postIds[index]]);
  };

  var showShuffle = function(postIds){
    shuffleDeck(postIds);
    for(var i = 0; i < postIds.length; i++){
      displayPost($scope.dataPosts[postIds[i]]);
    }
  };

  var showRank= function(postIds){
    var selectedPosts = [];
    for(var j = 0; j < postIds.length; j++){
      selectedPosts.push($scope.dataPosts[postIds[j]]);
    }
    selectedPosts.sort(function(a, b){
      return b.clicks-a.clicks;
    });
    for(var k = 0; k < selectedPosts.length; k++){
      displayPost(selectedPosts[k]);
    }
  };

/* ------------------------------------------------------------------------------------*/
/* LISTENERS
/* ------------------------------------------------------------------------------------*/


  $scope.listenForTitleClick = function(){
    angular.element('.container').on('click', 'h3', function(){
    var titleId = angular.element(this).attr('class');
    $scope.updateClickCount(titleId);
    });
  };

  var slugListener = function(){
    angular.element('.container').on('click', 'ul', function(){
      var tag = angular.element(this).text();
      var posts = $scope.slugs[tag];
      angular.element('.container').empty();
      for(var i = 0; i < posts.length; i++){
        var item = $scope.dataPosts[posts[i]];
        displayPost(item);
      }
    });
  };
  
  $scope.updateClickCount = function(titleId){
    var clickedPost = $scope.dataPosts[titleId];
    angular.element('.container').empty();
    clickedPost.clicks++;
    var serverObj = {};
    serverObj[titleId] = clickedPost;
    postNewClick(serverObj);
  };

/* ------------------------------------------------------------------------------------*/
/* HELPER FUNCTIONS
/* ------------------------------------------------------------------------------------*/

  
  $scope.onSearch = function(){
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

/* ------------------------------------------------------------------------------------*/
/* INIT INVOKED
/* ------------------------------------------------------------------------------------*/

  $scope.initialize();
  
});
