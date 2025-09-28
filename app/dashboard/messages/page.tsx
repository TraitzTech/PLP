'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Search, Phone, Video, MoveVertical as MoreVertical, Paperclip, Image as ImageIcon } from 'lucide-react';

// Mock conversations data
const mockConversations = [
  {
    id: '1',
    participant: {
      name: 'Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
      role: 'Property Owner',
    },
    property: 'Luxury Ocean View Villa',
    lastMessage: 'Thank you for your interest! The property is available for your dates.',
    timestamp: '2024-02-15T10:30:00Z',
    unread: 2,
    status: 'online',
  },
  {
    id: '2',
    participant: {
      name: 'Michael Chen',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      role: 'Property Owner',
    },
    property: 'Modern Downtown Apartment',
    lastMessage: 'I can offer a 10% discount for bookings over 7 days.',
    timestamp: '2024-02-14T15:45:00Z',
    unread: 0,
    status: 'offline',
  },
  {
    id: '3',
    participant: {
      name: 'Emma Rodriguez',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      role: 'Property Owner',
    },
    property: 'Cozy Mountain Cabin',
    lastMessage: 'The cabin has been recently renovated with new amenities.',
    timestamp: '2024-02-13T09:20:00Z',
    unread: 1,
    status: 'away',
  },
];

// Mock messages for selected conversation
const mockMessages = [
  {
    id: '1',
    senderId: 'user',
    content: 'Hi! I\'m interested in booking your property for next month. Is it available from March 15-20?',
    timestamp: '2024-02-15T09:00:00Z',
    type: 'text',
  },
  {
    id: '2',
    senderId: 'sarah',
    content: 'Hello! Yes, the property is available for those dates. The rate would be 720,000 XAF per night.',
    timestamp: '2024-02-15T09:15:00Z',
    type: 'text',
  },
  {
    id: '3',
    senderId: 'user',
    content: 'That sounds great! Can you tell me more about the amenities and nearby attractions?',
    timestamp: '2024-02-15T09:20:00Z',
    type: 'text',
  },
  {
    id: '4',
    senderId: 'sarah',
    content: 'Of course! The villa features a private pool, spa, and direct ocean access. There are several restaurants within walking distance.',
    timestamp: '2024-02-15T09:25:00Z',
    type: 'text',
  },
  {
    id: '5',
    senderId: 'sarah',
    content: 'Thank you for your interest! The property is available for your dates.',
    timestamp: '2024-02-15T10:30:00Z',
    type: 'text',
  },
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = mockConversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.property.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      senderId: 'user',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text' as const,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <DashboardLayout userType="customer">
      <div className="h-[calc(100vh-200px)]">
        <div className="flex h-full bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={conversation.participant.avatar} />
                        <AvatarFallback>
                          {conversation.participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conversation.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {conversation.participant.name}
                        </h3>
                        {conversation.unread > 0 && (
                          <Badge className="bg-plp-purple text-white text-xs">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{conversation.property}</p>
                      <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(conversation.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversation.participant.avatar} />
                      <AvatarFallback>
                        {selectedConversation.participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(selectedConversation.status)}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedConversation.participant.name}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedConversation.property}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === 'user'
                        ? 'bg-plp-purple text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.senderId === 'user' ? 'text-purple-200' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[40px] max-h-32 resize-none"
                  />
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="btn-primary"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}