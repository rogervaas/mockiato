var fact = angular.module("mockapp.factories",[]);

fact.factory('sutFactory', ['$http', '$q', function($http, $q) {
    return {
        getAllSUT: function() {
          var sutlist = [];

          $http.get('/api/systems')

          .then(function(response) {
              response.data.forEach(function(sutData) {
                var sut = {
                  name: sutData.name
                };

                sutlist.push(sut);
              });
          })

          .catch(function(err) {
              console.log(err);
          });

          return sutlist;
        },

        getGroupsByUser: function(user) {
            var sutlist = [];
            $http.get('/api/systems')

                .then(function (response) {
                    response.data.forEach(function (sutData) {
                        var sut = {
                            name: sutData.name,
                            members: sutData.members
                        };
                        sut.members.forEach(function(memberlist){
                            if(memberlist.indexOf(user) > -1){
                                sutlist.push(sut);
                            }
                        });
                    });
                })

                .catch(function (err) {
                    console.log(err);
                });
            return sutlist;
        },

        getGroupsToBeDeleted: function(user) {
            var deleteSutList = [];
            $http.get('/api/systems')

                .then(function (response) {
                    response.data.forEach(function (sutData) {
                        var sut = {
                            name: sutData.name,
                            members: sutData.members
                        };
                        sut.members.forEach(function(memberlist){
                            if(memberlist.indexOf(user) > -1){
                        $http.get('/api/services/sut/' + sut.name)
                        .then(function (response) {
                                if(response.data.length==0){
                                    $http.get('/api/services/sut/' + sut.name+'/archive')
                                    .then(function (response) {
                                            if(response.data.length==0){
                                                    $http.get('/api/services/sut/' + sut.name+'/draft')
                                                    .then(function (response) {
                                                        if(response.data.length==0){
                                                $http.get('/api/recording/sut/' + sut.name)
                                                .then(function (response) {
                                                    if(response.data.length==0){
                                                  //  console.log("Wee found",response.data);
                                        deleteSutList.push(sut);
                                                          }  })}})}
                            
                        })
                    }})
                         } });
            });})
                .catch(function (err) {
                    console.log(err);
                });
            return deleteSutList;
        }

    };
}]);

fact.factory('groupFactory', ['$http', function ($http) {
    return {
        getMembers: function (selectedSut) {
            var memberlist = [];
            
            $http.get('/api/systems/' + selectedSut)
                .then(function (response) {
                    for (var i = 0; i < response.data.members.length; i++) {
                        
                        var member = response.data.members[i];
                        memberlist.push(member);
                    }
                })

                .catch(function (err) {
                    console.log(err);
                });
            return memberlist;
        }
    };
}]);


fact.factory('userFactory', ['$http', function($http) {
    return {
        getAllUsers: function() {
          var userlist = [];

          $http.get('/api/users')

          .then(function(response) {
              var data = response.data;
              console.log(data);

              data.forEach(function(userData) {
                var user = {
                  name: userData.uid
                };

                userlist.push(user);
              });
          })

          .catch(function(err) {
              console.log(err);
          });

          return userlist;
        }
    };
}]);

fact.factory('headersFactory', ['$http', function($http) {
    return {
        getPossibleHeaders: function() {
          var headersList = [];

          $http.get('/data/headers.json')

          .then(function(response) {
              var data = response.data;
              data.forEach(function(header) {
                  headersList.push(header);
              });
          })

          .catch(function(err) {
              console.log(err);
          });

          return headersList;
        }
    };
}]);

fact.factory('statusCodesFactory', ['$http', function($http) {
    return {
        getStatusCodes: function() {
          var codesList = [];

          $http.get('/data/statuses.json')

          .then(function(response) {
              var data = response.data;
              data.forEach(function(status) {
                  codesList.push(status);
              });
          })

          .catch(function(err) {
              console.log(err);
          });

          return codesList;
        }
    };
}]);

fact.factory('mqInfoFactory', ['$http', function($http) {
    return {
        getMQInfo: function() {
          return $http.get('/api/mqinfo');
        }
    };
}]);

//Below function is complex one. Any change will break Duplicate Req check. - Pradeep
fact.factory('helperFactory', [function () {
    return {
        isDuplicateReq: function (servicevo) {
            var isSameReq = false;
            LOOP1:
            for (var i = 0; i < servicevo.rawpairs.length - 1; i++) {
                var rawPair1 = servicevo.rawpairs[i];
                if (!rawPair1.hasOwnProperty('requestpayload') || (rawPair1.hasOwnProperty('requestpayload') && 
                                    rawPair1['requestpayload'] == '')) {
                    rawPair1['requestpayload'] = '';
                }
                for (var j = i + 1; j < servicevo.rawpairs.length; j++) {
                    var rawPair2 = servicevo.rawpairs[j];
                    if(!rawPair2.hasOwnProperty('requestpayload') || (rawPair2.hasOwnProperty('requestpayload') && 
                                    rawPair2['requestpayload'] == '')){
                        rawPair2['requestpayload']='';
                    }
                    var isAnyReqPairDuplicate = true;
                    LOOP2:
                    for (var ky in rawPair1) {
                        var key1, value1;
                        if (rawPair1.hasOwnProperty(ky)) {
                            var filterVal = rawPair1[ky];
                            if (['queriesArr', 'reqHeadersArr'].includes(ky)) {
                                filterVal = filterVal.filter(o => o.k != undefined);
                            }
                            key1 = ky;
                            value1 = filterVal;
                        }
                        LOOP3:
                        for (var ki in rawPair2) {
                            var key2, value2;
                            if (rawPair2.hasOwnProperty(ki)) {
                                var filterVal2 = rawPair2[ki];
                                if (['queriesArr', 'reqHeadersArr'].includes(ki)) {
                                    filterVal2 = filterVal2.filter(o => o.k != undefined);
                                }
                                key2 = ki;
                                value2 = filterVal2;
                            }
                            if (key1 == 'id' || key1 == 'resHeadersArr' || key1 == '$$hashKey' || key1 == 'responsepayload' ||
                                key1 == 'resStatus' || key1 == 'queries' || key1 == 'resHeaders' || key1 == 'reqHeaders' ||
                                key1 == 'reqData' || key1 == 'resData' || key1 == 'verb' || key1 == '_id') break;
                            else if (key1 !== key2 || key2 == 'id' || key1 == 'resHeadersArr' || key1 == '$$hashKey' || key1 == 'responsepayload' ||
                                key1 == 'resStatus' || key1 == 'queries' || key1 == 'resHeaders' || key1 == 'reqHeaders' ||
                                key1 == 'reqData' || key1 == 'resData' || key1 == 'verb' || key1 == '_id') continue;
                            else if (['method', 'payloadType', 'path', 'queriesArr', 'reqHeadersArr', 'requestpayload'].includes(key1) &&
                                !angular.equals(value2, value1)
                            ) {
                                isAnyReqPairDuplicate = false;
                                break LOOP2;
                            } else {
                                break LOOP3;
                            }
                        }
                    }
                    if (isAnyReqPairDuplicate) {
                        isSameReq = true;
                        break LOOP1;
                    }
                }
            };
            return isSameReq;
        }
    };
}]);
