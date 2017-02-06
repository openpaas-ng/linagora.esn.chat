'use strict';

/* global chai, sinon: false */

var expect = chai.expect;

describe('The chatConversationResolverService service', function() {
  var $rootScope, $state, $q, chatConversationActionsService, chatConversationsStoreService, chatLastConversationService, chatConversationResolverService, conversationId;
  var successSpy, errorSpy;

  beforeEach(
    angular.mock.module('linagora.esn.chat')
  );

  beforeEach(function() {
    chatConversationActionsService = {};
    conversationId = 'conversationTest';
    chatConversationsStoreService = {
      channels: [{_id: conversationId}]
    };
    chatLastConversationService = {};
    successSpy = sinon.spy();
    errorSpy = sinon.spy();
    $state = {
      go: sinon.spy()
    };
  });

  beforeEach(function() {
    module('linagora.esn.chat', function($provide) {
      $provide.value('searchProviders', {add: angular.noop});
      $provide.value('chatSearchMessagesProviderService', {});
      $provide.value('chatSearchConversationsProviderService', {});
      $provide.value('searchProviders', {add: sinon.spy()});
      $provide.value('$state', $state);
      $provide.value('chatConversationActionsService', chatConversationActionsService);
      $provide.value('chatConversationsStoreService', chatConversationsStoreService);
      $provide.value('chatLastConversationService', chatLastConversationService);
    });
  });

  beforeEach(function() {
    inject(function(_$rootScope_, _$q_, _chatConversationResolverService_) {
      $rootScope = _$rootScope_;
      $q = _$q_;
      chatConversationResolverService = _chatConversationResolverService_;

      chatConversationActionsService.ready = $q.when();
    });
  });

  describe('When input conversation is defined', function() {
    it('should resolve with the input conversation when defined', function() {
      chatLastConversationService.get = sinon.spy();

      chatConversationResolverService(conversationId).then(successSpy, errorSpy);
      $rootScope.$digest();

      expect(chatLastConversationService.get).to.not.have.been.called;
      expect(successSpy).to.have.been.calledWith(conversationId);
      expect(errorSpy).to.not.have.been.called;
    });
  });

  describe('When input conversation is undefined', function() {
    it('should resolve with the chatLastConversationService.get result when defined', function() {
      var lastConversation = 'lastConversationId';

      chatLastConversationService.get = sinon.spy(function() {
        return $q.when(lastConversation);
      });

      chatConversationResolverService().then(successSpy, errorSpy);
      $rootScope.$digest();

      expect(chatLastConversationService.get).to.have.been.calledOnce;
      expect(successSpy).to.have.been.calledWith(lastConversation);
      expect(errorSpy).to.not.have.been.called;
      expect($state.go).to.have.been.calledWith('chat.channels-views', {id: lastConversation});
    });

    it('should resolve with the default channel when chatLastConversationService.get resolves with undefined', function() {
      chatLastConversationService.get = sinon.spy(function() {
        return $q.when();
      });

      chatConversationResolverService().then(successSpy, errorSpy);
      $rootScope.$digest();

      expect(chatLastConversationService.get).to.have.been.calledOnce;
      expect(successSpy).to.have.been.calledWith(conversationId);
      expect(errorSpy).to.not.have.been.called;
      expect($state.go).to.have.been.calledWith('chat.channels-views', {id: conversationId});
    });

    it('should resolve with the default channel when chatLastConversationService.get rejects', function() {
      chatLastConversationService.get = sinon.spy(function() {
        return $q.reject(new Error('I failed'));
      });

      chatConversationResolverService().then(successSpy, errorSpy);
      $rootScope.$digest();

      expect(chatLastConversationService.get).to.have.been.calledOnce;
      expect(successSpy).to.have.been.calledWith(conversationId);
      expect(errorSpy).to.not.have.been.called;
      expect($state.go).to.have.been.calledWith('chat.channels-views', {id: conversationId});
    });
  });
});