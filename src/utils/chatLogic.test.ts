import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatAppleTime,
  formatConversationDate,
  formatDateDivider,
  groupMessages,
  toggleReaction,
  filterConversations,
  serializeWSPacket,
  parseWSPacket,
} from './chatLogic';
import { Message, ChatConversation } from '../types/chat';

test('formatAppleTime formats hours and minutes correctly', () => {
  const ts = new Date(2026, 10, 6, 14, 30).getTime();
  const time = formatAppleTime(ts);
  assert.match(time, /14:30/);
});

test('formatConversationDate returns time for today and Ontem for yesterday', () => {
  const now = new Date(2026, 10, 6, 16, 0).getTime();
  const todayMsg = new Date(2026, 10, 6, 10, 0).getTime();
  const yesterdayMsg = new Date(2026, 10, 5, 18, 0).getTime();

  assert.match(formatConversationDate(todayMsg, now), /10:00/);
  assert.equal(formatConversationDate(yesterdayMsg, now), 'Ontem');
});

test('groupMessages handles Apple bubble clustering and tails', () => {
  const currentUserId = 'user-steve';
  const baseTime = 1700000000000;

  const messages: Message[] = [
    {
      id: 'm1',
      chatId: 'c1',
      senderId: 'user-steve',
      senderName: 'Steve',
      text: 'Olá Tim!',
      timestamp: baseTime,
      status: 'delivered',
      type: 'text',
    },
    {
      id: 'm2',
      chatId: 'c1',
      senderId: 'user-steve',
      senderName: 'Steve',
      text: 'Como estão os novos designs?',
      timestamp: baseTime + 30000, // 30s later (grouped!)
      status: 'delivered',
      type: 'text',
    },
    {
      id: 'm3',
      chatId: 'c1',
      senderId: 'user-tim',
      senderName: 'Tim',
      text: 'Estão incríveis, dá uma olhada!',
      timestamp: baseTime + 60000,
      status: 'delivered',
      type: 'text',
    },
  ];

  const grouped = groupMessages(messages, currentUserId, false);

  assert.equal(grouped.length, 3);
  // First message from Steve should not be last in group (no tail)
  assert.equal(grouped[0].isFirstInGroup, true);
  assert.equal(grouped[0].isLastInGroup, false);

  // Second message from Steve should be last in Steve's cluster (has tail!)
  assert.equal(grouped[1].isFirstInGroup, false);
  assert.equal(grouped[1].isLastInGroup, true);

  // Third message from Tim (different sender)
  assert.equal(grouped[2].isFirstInGroup, true);
  assert.equal(grouped[2].isLastInGroup, true);
  assert.equal(grouped[2].showAvatar, true);
});

test('toggleReaction adds and toggles tapbacks', () => {
  const msg: Message = {
    id: 'm1',
    chatId: 'c1',
    senderId: 'user-tim',
    senderName: 'Tim',
    text: 'Reunião confirmada',
    timestamp: 1000,
    status: 'delivered',
    type: 'text',
  };

  // Add ❤️
  const withHeart = toggleReaction(msg, '❤️', 'user-steve');
  assert.deepEqual(withHeart.reactions?.['❤️'], ['user-steve']);

  // Click ❤️ again -> should remove it
  const withoutHeart = toggleReaction(withHeart, '❤️', 'user-steve');
  assert.equal(withoutHeart.reactions?.['❤️'], undefined);

  // Click 👍 -> should add 👍
  const withThumbs = toggleReaction(msg, '👍', 'user-steve');
  assert.deepEqual(withThumbs.reactions?.['👍'], ['user-steve']);

  // Switch to 😂 -> should remove 👍 and add 😂
  const switched = toggleReaction(withThumbs, '😂', 'user-steve');
  assert.equal(switched.reactions?.['👍'], undefined);
  assert.deepEqual(switched.reactions?.['😂'], ['user-steve']);
});

test('filterConversations matches by name and recent message', () => {
  const convos: ChatConversation[] = [
    {
      id: '1',
      name: 'Tim Cook',
      isGroup: false,
      unreadCount: 0,
      lastMessage: 'Keynote pronta!',
      participants: [{ id: 'tim', name: 'Tim Cook', avatar: '', isOnline: true }],
    },
    {
      id: '2',
      name: 'Equipe Design',
      isGroup: true,
      unreadCount: 2,
      lastMessage: 'Aprovado o mockup',
      participants: [{ id: 'craig', name: 'Craig', avatar: '', isOnline: true }],
    },
  ];

  assert.equal(filterConversations(convos, 'Tim').length, 1);
  assert.equal(filterConversations(convos, 'mockup').length, 1);
  assert.equal(filterConversations(convos, 'Inexistente').length, 0);
  assert.equal(filterConversations(convos, '').length, 2);
});

test('serializeWSPacket and parseWSPacket work bidirectionally', () => {
  const payload = { text: 'Ping!', id: 123 };
  const raw = serializeWSPacket('message', payload);
  const parsed = parseWSPacket(raw);

  assert.ok(parsed);
  assert.equal(parsed?.type, 'message');
  assert.deepEqual(parsed?.payload, payload);
});
