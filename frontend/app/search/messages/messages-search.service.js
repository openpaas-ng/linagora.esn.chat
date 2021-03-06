(function() {
  'use strict';

  angular.module('linagora.esn.chat')
    .service('chatSearchMessagesService', chatSearchMessagesService);

  function chatSearchMessagesService($q, $filter, CHAT, chatParseMention, ChatRestangular) {
    var type = 'chat.message';

    return {
      buildFetcher: buildFetcher
    };

    ////////////

    function buildFetcher(query) {
      var offset = 0;

      return function() {
        var data = [];

        return _searchMessages(query, {
          offset: offset,
          limit: CHAT.DEFAULT_FETCH_SIZE
        }).then(function(response) {
          offset += response.data.length;
          data = response.data;

          return $q.all(response.data.map(function(message) {
            return chatParseMention.parseMentions(message.text, message.user_mentions, {skipLink: true});
          }));
        }).then(function(results) {
          return data.map(function(message, index) {
            message.type = type;
            message.text = $filter('linky')(message.text, '_blank');
            message.text = $filter('esnEmoticonify')(message.text, {class: 'chat-emoji'});
            message.text = results[index];
            message.date = message.timestamps.creation;

            return message;
          });
        });
      };
    }

    function _searchMessages(term, options) {
      options = angular.extend({search: term}, options);

      return ChatRestangular.all('messages').getList(options);
    }
  }
})();
