(function() {
  'use strict';

  angular
    .module('linagora.esn.chat')
    .controller('ChatConversationViewController', ChatConversationViewController);

  ChatConversationViewController.$inject = ['$scope', '$q', 'session', 'chatConversationService', 'chatConversationsService', 'CHAT_EVENTS', 'CHAT', 'chatScrollService', 'chatLocalStateService', '$stateParams', 'usSpinnerService', 'MESSAGE_GROUP_TIMESPAN', 'chatComposerState'];

  function ChatConversationViewController($scope, $q, session, chatConversationService, chatConversationsService, CHAT_EVENTS, CHAT, chatScrollService, chatLocalStateService, $stateParams, usSpinnerService, MESSAGE_GROUP_TIMESPAN, chatComposerState) {
    var self = this;

    self.spinnerKey = 'ChatConversationSpinner';
    self.chatLocalStateService = chatLocalStateService;
    self.user = session.user;
    self.messages = [];
    self.glued = true;
    self.loadPreviousMessages = loadPreviousMessages;
    self.newMessage = newMessage;
    self.updateTopic = updateTopic;
    self.chatLocalStateService.ready.then(init);

    function addUniqId(message) {
      message._uniqId = message.creator._id + ':' + message.timestamps.creation + '' + message.text;
    }

    function getConversationId() {
      return $stateParams.id || (self.chatLocalStateService.channels && self.chatLocalStateService.channels[0] && self.chatLocalStateService.channels[0]._id);
    }

    function getOlderMessageId() {
      return self.messages && self.messages[0] && self.messages[0]._id;
    }

    function newMessage(message) {
      addUniqId(message);
      // chances are, the new message is the most recent
      // So we traverse the array starting by the end
      for (var i = self.messages.length - 1; i > -1; i--) {
        if (self.messages[i].timestamps.creation < message.timestamps.creation) {
          message.sameUser = isSameUser(message, self.messages[i]);
          self.messages.splice(i + 1, 0, message);

          return;
        }
      }
      message.sameUser = false;
      self.messages.unshift(message);
    }

    function queueOlderMessages(messages, isFirstLoad) {
      if (isFirstLoad) {
        return messages.forEach(function(message) {
          addUniqId(message);
          self.messages.push(message);
        });
      }

      messages.reverse().forEach(function(message) {
        addUniqId(message);
        self.messages.unshift(message);
      });
    }

    function loadPreviousMessages(isFirstLoad) {
      isFirstLoad = isFirstLoad || false;
      var conversationId = getConversationId();
      var options = {limit: CHAT.DEFAULT_FETCH_SIZE};
      var older = getOlderMessageId();

      if (older) {
        options.before = older;
      }

      usSpinnerService.spin(self.spinnerKey);

      return chatConversationService.fetchMessages(conversationId, options)
      .then(checkMessagesOfSameUser)
      .then(function(result) {
        var lastLoaded = result.length - 1;

        queueOlderMessages(result, isFirstLoad);
        if (!isFirstLoad && lastLoaded > 0) {
          self.messages[lastLoaded + 1].sameUser = isSameUser(self.messages[lastLoaded], self.messages[lastLoaded + 1]);
        }

        return self.messages;
      })
      .finally(function() {
        usSpinnerService.stop(self.spinnerKey);
      });
    }

    function checkMessagesOfSameUser(messages) {
      var previousMessage;

      messages.forEach(function(message) {
        if (!previousMessage) {
          previousMessage = message;
          message.sameUser = false;
        } else {
          message.sameUser = isSameUser(previousMessage, message);
          previousMessage = message;
        }
      });

      return messages;
    }

    function scrollDown() {
      chatScrollService.scrollDown();
    }

    function updateTopic($data) {
      chatConversationsService.updateConversationTopic($data, self.chatLocalStateService.activeRoom._id);
    }

    function isSameUser(previousMessage, nextMessage) {
      return previousMessage.creator._id === nextMessage.creator._id &&
      Math.abs(nextMessage.timestamps.creation - previousMessage.timestamps.creation) < MESSAGE_GROUP_TIMESPAN;
    }

    function onDestroy(conversationId) {
      chatComposerState.saveMessage(conversationId, {text: $scope.text});

      if (self.chatLocalStateService.activeRoom && self.chatLocalStateService.activeRoom._id === conversationId) {
        self.chatLocalStateService.unsetActive();
      }
    }

    function init() {
      var conversationId = getConversationId();

      if (conversationId) {
        self.chatLocalStateService.setActive(conversationId);
        loadPreviousMessages(true).then(scrollDown);
      }

      $scope.$on('$destroy', onDestroy(conversationId));
    }

    [CHAT_EVENTS.TEXT_MESSAGE, CHAT_EVENTS.FILE_MESSAGE].forEach(function(eventReceived) {
      $scope.$on(eventReceived, function(event, message) {
        if (message.channel && message.channel === self.chatLocalStateService.activeRoom._id) {
          self.newMessage(message);
          scrollDown();
        }
      });
    });
  }
})();
