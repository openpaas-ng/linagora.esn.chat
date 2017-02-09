'use strict';

/* global chai: false */

var expect = chai.expect;

describe('The chatConversationsStoreService service', function() {

  var members, chatConversationsStoreService, conversation, publicConversation, confidentialConversation;
  var CHAT_CONVERSATION_TYPE, CHAT_MEMBER_STATUS;

  beforeEach(function() {
    conversation = {_id: 0, name: 'My conversation'};
    publicConversation = {_id: 1, name: 'My public conversation'};
    confidentialConversation = {_id: 2, name: 'My confidential conversation'};
    members = [{_id: 'userId1'}, {_id: 'userId2'}];

    module('linagora.esn.chat', function($provide) {
      $provide.value('searchProviders', {
        add: angular.noop
      });
      $provide.value('chatSearchMessagesProviderService', {});
      $provide.value('chatSearchConversationsProviderService', {});
    });
  });

  beforeEach(angular.mock.inject(function(_chatConversationsStoreService_, _CHAT_CONVERSATION_TYPE_, _CHAT_MEMBER_STATUS_) {
    chatConversationsStoreService = _chatConversationsStoreService_;
    CHAT_CONVERSATION_TYPE = _CHAT_CONVERSATION_TYPE_;
    CHAT_MEMBER_STATUS = _CHAT_MEMBER_STATUS_;

    publicConversation.type = CHAT_CONVERSATION_TYPE.OPEN;
    confidentialConversation.type = CHAT_CONVERSATION_TYPE.CONFIDENTIAL;
  }));

  describe('The addConversation function', function() {
    it('should not add the conversation in conversations if already in', function() {
      chatConversationsStoreService.conversations = [conversation];
      chatConversationsStoreService.addConversation(conversation);

      expect(chatConversationsStoreService.conversations).to.deep.equals([conversation]);
      expect(chatConversationsStoreService.channels).to.deep.equals([]);
      expect(chatConversationsStoreService.privateConversations).to.deep.equals([]);
    });

    it('should add the conversation in conversations if not alreay in', function() {
      chatConversationsStoreService.conversations = [];
      chatConversationsStoreService.addConversation(conversation);

      expect(chatConversationsStoreService.conversations).to.deep.equals([conversation]);
    });

    it('should add the conversation in channels when type is open', function() {
      chatConversationsStoreService.conversations = [];
      chatConversationsStoreService.addConversation(publicConversation);

      expect(chatConversationsStoreService.conversations).to.deep.equals([publicConversation]);
      expect(chatConversationsStoreService.channels).to.deep.equals([publicConversation]);
      expect(chatConversationsStoreService.privateConversations).to.deep.equals([]);
    });

    it('should add the conversation in privateConversations when type is confidential', function() {
      conversation.type = CHAT_CONVERSATION_TYPE.CONFIDENTIAL;
      chatConversationsStoreService.conversations = [];
      chatConversationsStoreService.addConversation(confidentialConversation);

      expect(chatConversationsStoreService.conversations).to.deep.equals([confidentialConversation]);
      expect(chatConversationsStoreService.channels).to.deep.equals([]);
      expect(chatConversationsStoreService.privateConversations).to.deep.equals([confidentialConversation]);
    });
  });

  describe('The addConversations function', function() {
    it('should do nothing when input is undefined', function() {
      chatConversationsStoreService.conversations = [];
      chatConversationsStoreService.addConversations();

      expect(chatConversationsStoreService.conversations).to.deep.equals([]);
      expect(chatConversationsStoreService.channels).to.deep.equals([]);
      expect(chatConversationsStoreService.privateConversations).to.deep.equals([]);
    });

    it('should do nothing when input is empty', function() {
      chatConversationsStoreService.conversations = [];
      chatConversationsStoreService.addConversations([]);

      expect(chatConversationsStoreService.conversations).to.deep.equals([]);
      expect(chatConversationsStoreService.channels).to.deep.equals([]);
      expect(chatConversationsStoreService.privateConversations).to.deep.equals([]);
    });

    it('should add the given conversations to the store', function() {
      chatConversationsStoreService.conversations = [];
      chatConversationsStoreService.addConversations([publicConversation, confidentialConversation]);

      expect(chatConversationsStoreService.conversations.length).to.equal(2);
      expect(chatConversationsStoreService.channels).to.deep.equals([publicConversation]);
      expect(chatConversationsStoreService.privateConversations).to.deep.equals([confidentialConversation]);
    });
  });

  describe('The addMembers function', function() {
    it('should add members to the conversation if it already exists', function() {
      chatConversationsStoreService.conversations = [conversation];
      chatConversationsStoreService.addMembers(conversation, members);

      expect(chatConversationsStoreService.conversations[0].members).to.deep.equals(members);
    });

    it('should add the conversation with new members if it does not exists', function() {
      chatConversationsStoreService.conversations = [];
      chatConversationsStoreService.addMembers(conversation, members);

      expect(chatConversationsStoreService.conversations[0].members).to.deep.equals(members);
    });
  });

  describe('The deleteConversation function', function() {
    it('should do nothing when the conversation does not exists', function() {
      chatConversationsStoreService.conversations = [conversation];
      chatConversationsStoreService.deleteConversation(publicConversation);

      expect(chatConversationsStoreService.conversations).to.deep.equals([conversation]);
      expect(chatConversationsStoreService.channels).to.deep.equals([]);
      expect(chatConversationsStoreService.privateConversations).to.deep.equals([]);
    });

    it('should remove conversation from conversations and channels when type is open', function() {
      chatConversationsStoreService.conversations = [conversation, publicConversation];
      chatConversationsStoreService.channels = [publicConversation];
      chatConversationsStoreService.deleteConversation(publicConversation);

      expect(chatConversationsStoreService.conversations).to.deep.equals([conversation]);
      expect(chatConversationsStoreService.channels).to.deep.equals([]);
      expect(chatConversationsStoreService.privateConversations).to.deep.equals([]);
    });

    it('should remove conversation from conversations and privateConversations when type is confidential', function() {
      chatConversationsStoreService.conversations = [conversation, confidentialConversation];
      chatConversationsStoreService.privateConversations = [confidentialConversation];
      chatConversationsStoreService.deleteConversation(confidentialConversation);

      expect(chatConversationsStoreService.conversations).to.deep.equals([conversation]);
      expect(chatConversationsStoreService.channels).to.deep.equals([]);
      expect(chatConversationsStoreService.privateConversations).to.deep.equals([]);
    });
  });

  describe('The findConversation function', function() {
    it('should return nothing when conversation is not found', function() {
      chatConversationsStoreService.conversations = [conversation];

      expect(chatConversationsStoreService.findConversation(confidentialConversation._id)).to.be.falsy;
    });

    it('should return the conversation from the store', function() {
      chatConversationsStoreService.conversations = [conversation, publicConversation, confidentialConversation];

      expect(chatConversationsStoreService.findConversation(conversation._id)).to.deep.equal(conversation);
    });
  });

  describe('The find function', function() {
    it('should return nothing when conversation is not found', function() {
      chatConversationsStoreService.conversations = [conversation, publicConversation, confidentialConversation];

      expect(chatConversationsStoreService.find({name: 'foo'})).to.be.falsy;
    });

    it('should return conversation matching the given filter', function() {
      chatConversationsStoreService.conversations = [conversation, publicConversation, confidentialConversation];

      expect(chatConversationsStoreService.find({name: conversation.name})).to.deep.equals(conversation);
    });
  });

  describe('The getNumberOfUnreadedMessages function', function() {
    it('should return the sum of unreads from all the stored conversations', function() {
      conversation.unreadMessageCount = 2;
      publicConversation.unreadMessageCount = 3;

      chatConversationsStoreService.conversations = [conversation, publicConversation, confidentialConversation];

      expect(chatConversationsStoreService.getNumberOfUnreadedMessages()).to.equal(5);
    });
  });

  describe('The isActiveRoom function', function() {
    it('should return false when conversationId is null', function() {
      expect(chatConversationsStoreService.isActiveRoom()).to.be.false;
    });

    it('should return true when input is equal to the activeRoom id', function() {
      chatConversationsStoreService.conversations = [conversation, publicConversation];
      chatConversationsStoreService.setActive(publicConversation._id);

      expect(chatConversationsStoreService.isActiveRoom(publicConversation._id)).to.be.true;
    });

    it('should return false when input is not equal to the activeRoom id', function() {
      chatConversationsStoreService.conversations = [conversation, publicConversation];
      chatConversationsStoreService.setActive(publicConversation._id);

      expect(chatConversationsStoreService.isActiveRoom(conversation._id)).to.be.false;
    });
  });

  describe('The joinConversation function', function() {
    it('should do nothing when conversation is null', function() {
      chatConversationsStoreService.joinConversation();

      expect(chatConversationsStoreService.conversations).to.deep.equal([]);
    });

    it('should set the member_status and add the conversation to the store', function() {
      chatConversationsStoreService.joinConversation(conversation);

      expect(chatConversationsStoreService.conversations).to.deep.equal([{_id: conversation._id, name: conversation.name, member_status: CHAT_MEMBER_STATUS.MEMBER}]);
    });
  });

  describe('The leaveConversation function', function() {
    it('should delete the conversation from the store', function() {
      chatConversationsStoreService.conversations = [conversation, publicConversation];
      chatConversationsStoreService.channels = [publicConversation];
      chatConversationsStoreService.leaveConversation(publicConversation);

      expect(chatConversationsStoreService.conversations).to.deep.equals([conversation]);
      expect(chatConversationsStoreService.channels).to.deep.equals([]);
    });
  });

  describe('The markAllMessagesAsRead function', function() {
    it('should set unreadMessageCount to 0', function() {
      conversation.unreadMessageCount = 2;
      confidentialConversation.unreadMessageCount = 3;
      chatConversationsStoreService.conversations = [conversation, publicConversation, confidentialConversation];
      chatConversationsStoreService.channels = [publicConversation];
      chatConversationsStoreService.privateConversations = [confidentialConversation];

      chatConversationsStoreService.markAllMessagesAsRead(conversation);

      expect(conversation.unreadMessageCount).to.equal(0);
      expect(confidentialConversation.unreadMessageCount).to.equal(3);
    });
  });

  describe('The setActive function', function() {
    it('should return false when conversation is not found', function() {
      expect(chatConversationsStoreService.setActive(conversation._id)).to.be.false;
    });

    it('should set activeRoom to the given one, reset unreads and mentions', function() {
      conversation.unreadMessageCount = 3;
      conversation.mentionCount = 10;
      chatConversationsStoreService.conversations = [conversation, publicConversation];

      expect(chatConversationsStoreService.setActive(conversation._id)).to.be.true;
      expect(chatConversationsStoreService.activeRoom).to.deep.equal(conversation);
      expect(conversation.unreadMessageCount).to.equal(0);
      expect(conversation.mentionCount).to.equal(0);
    });
  });

  describe('The updateConversation function', function() {
    it('should add conversation as is when not already in store', function() {
      chatConversationsStoreService.conversations = [conversation];

      chatConversationsStoreService.updateConversation(publicConversation);
      expect(chatConversationsStoreService.conversations.length).to.equal(2);
      expect(chatConversationsStoreService.channels).to.deep.equal([publicConversation]);
    });

    it('should update existing conversation attributes', function() {
      var updateConversation = {_id: publicConversation._id, name: 'My new name', members: members, avatar: 'New avatar'};

      chatConversationsStoreService.conversations = [conversation, publicConversation];
      chatConversationsStoreService.channels = [publicConversation];
      chatConversationsStoreService.updateConversation(updateConversation);

      expect(chatConversationsStoreService.channels).to.shallowDeepEqual([
        {
          _id: publicConversation._id,
          name: updateConversation.name,
          members: updateConversation.members,
          avatar: updateConversation.avatar
        }
      ]);
    });
  });

  describe('The updateTopic function', function() {
    it('should add the conversation if not found', function() {
      var topic = {value: 'My new topic'};

      chatConversationsStoreService.conversations = [conversation];
      chatConversationsStoreService.updateTopic(publicConversation, topic);

      expect(chatConversationsStoreService.channels).to.shallowDeepEqual([
        {
          _id: publicConversation._id,
          name: publicConversation.name,
          topic: topic
        }
      ]);
    });

    it('should update the topic of the conversation', function() {
      var topic = {value: 'My new topic'};

      chatConversationsStoreService.conversations = [conversation, publicConversation];
      chatConversationsStoreService.channels = [publicConversation];
      chatConversationsStoreService.updateTopic(publicConversation, topic);

      expect(chatConversationsStoreService.channels).to.shallowDeepEqual([
        {
          _id: publicConversation._id,
          name: publicConversation.name,
          topic: topic
        }
      ]);
    });
  });
});
