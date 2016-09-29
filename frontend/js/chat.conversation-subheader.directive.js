(function() {
  /*eslint strict: [2, "function"]*/
  'use strict';

  angular
    .module('linagora.esn.chat')
    .directive('chatConversationSubheader', chatConversationSubheader);

  function chatConversationSubheader() {
    var directive = {
      restrict: 'E',
      scope: true,
      templateUrl: '/chat/views/subheaders/channel.html',
      controller: 'chatConversationSubheaderController'
    };

    return directive;
  }
})();
