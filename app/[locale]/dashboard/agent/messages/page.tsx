'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, Search, Phone, Video, MoveVertical as MoreVertical, Paperclip, Image as ImageIcon, Star } from 'lucide-react';

// Mock conversations data for agent
const mockConversations = [
  {
    id: '1',
    client: {
      name: 'Marie Dubois',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
      status: 'online',
    },
    property: 'Luxury Villa Bastos',
    lastMessage: 'Merci pour les informations détaillées. Je confirme ma réservation.',
    timestamp: '2024-02-15T14:30:00Z',
    unread: 2,
    priority: 'high',
  },
  {
    id: '2',
    client: {
      name: 'Jean-Paul Kamga',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      status: 'away',
    },
    property: 'Modern Apartment Bonanjo',
    lastMessage: 'Pouvez-vous me donner plus de détails sur les équipements?',
    timestamp: '2024-02-15T12:45:00Z',
    unread: 0,
    priority: 'medium',
  },
  {
    id: '3',
    client: {
      name: 'Fatima Nkomo',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      status: 'offline',
    },
    property: 'Executive Suite Akwa',
    lastMessage: 'Excellent service! Je recommande vivement cette propriété.',
    timestamp: '2024-02-14T16:20:00Z',
    unread: 1,
    priority: 'low',
  },
  {
    id: '4',
    client: {
      name: 'Robert Tchoumi',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      status: 'online',
    },
    property: 'Villa Familiale Biyem',
    lastMessage: 'Je souhaiterais visiter la propriété ce weekend.',
    timestamp: '2024-02-14T09:15:00Z',
    unread: 3,
    priority: 'high',
  },
];

// Mock messages for selected conversation
const mockMessages = [
  {
    id: '1',
    senderId: 'client',
    senderName: 'Marie Dubois',
    content: 'Bonjour, je suis intéressée par votre villa à Bastos. Pourriez-vous me donner plus d\'informations?',
    timestamp: '2024-02-15T10:00:00Z',
    type: 'text',
  },
  {
    id: '2',
    senderId: 'agent',
    senderName: 'Agent Mballa',
    content: 'Bonjour Marie! Je serais ravi de vous aider. Cette villa dispose de 4 chambres, 3 salles de bain, une piscine privée et une vue magnifique sur la ville.',
    timestamp: '2024-02-15T10:15:00Z',
    type: 'text',
  },
  {
    id: '3',
    senderId: 'client',
    senderName: 'Marie Dubois',
    content: 'C\'est parfait! Quel est le tarif pour un séjour de 5 nuits?',
    timestamp: '2024-02-15T10:20:00Z',
    type: 'text',
  },
  {
    id: '4',
    senderId: 'agent',
    senderName: 'Agent Mballa',
    content: 'Pour 5 nuits, le tarif serait de 2,400,000 XAF (480,000 XAF par nuit). Cela inclut le ménage et l\'accès à tous les équipements.',
    timestamp: '2024-02-15T10:25:00Z',
    type: 'text',
  },
  {
    id: '5',
    senderId: 'client',
    senderName: 'Marie Dubois',
    content: 'Merci pour les informations détaillées. Je confirme ma réservation.',
    timestamp: '2024-02-15T14:30:00Z',
    type: 'text',
  },
];

export default function AgentMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = mockConversations.filter(conv =>
    conv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.property.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      senderId: 'agent',
      senderName: 'Agent Mballa',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text' as const,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalUnread = mockConversations.reduce((sum, conv) => sum + conv.unread, 0);

  return (
    <DashboardLayout userType="agent">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages Clients</h1>
            <p className="text-gray-600 mt-2">
              Communiquez avec vos clients et gérez leurs demandes.
              {totalUnread > 0 && (
                <Badge className="ml-2 bg-red-100 text-red-800">
                  {totalUnread} non lu{totalUnread > 1 ? 's' : ''}
                </Badge>
              )}
            </p>
          </div>
        </div>

        {/* Messages Interface */}
        <div className="h-[calc(100vh-300px)]">
          <div className="flex h-full bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Conversations List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher des conversations..."
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
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conversation.client.avatar} />
                          <AvatarFallback>
                            {conversation.client.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(conversation.client.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.client.name}
                          </h3>
                          <div className="flex items-center gap-1">
                            {conversation.unread > 0 && (
                              <Badge className="bg-plp-purple text-white text-xs">
                                {conversation.unread}
                              </Badge>
                            )}
                            <Badge className={getPriorityColor(conversation.priority)} variant="outline">
                              {conversation.priority}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-1 truncate">{conversation.property}</p>
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
                        <AvatarImage src={selectedConversation.client.avatar} />
                        <AvatarFallback>
                          {selectedConversation.client.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(selectedConversation.client.status)}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {selectedConversation.client.name}
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
                    className={`flex ${message.senderId === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-start space-x-2 max-w-xs lg:max-w-md">
                      {message.senderId === 'client' && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={selectedConversation.client.avatar} />
                          <AvatarFallback className="text-xs">
                            {selectedConversation.client.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.senderId === 'agent'
                            ? 'bg-plp-purple text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === 'agent' ? 'text-purple-200' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                      {message.senderId === 'agent' && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs bg-plp-purple text-white">
                            AM
                          </AvatarFallback>
                        </Avatar>
                      )}
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
                      placeholder="Tapez votre message..."
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages Prioritaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockConversations.filter(c => c.priority === 'high').map((conv) => (
                  <div key={conv.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={conv.client.avatar} />
                        <AvatarFallback className="text-xs">
                          {conv.client.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{conv.client.name}</p>
                        <p className="text-xs text-gray-600">{conv.property}</p>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      {conv.unread}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Messages aujourd'hui</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Temps de réponse moyen</span>
                  <span className="font-semibold">12 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taux de satisfaction</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">4.8</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Modèles de Messages
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  Programmer un Appel
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  Demander un Avis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}