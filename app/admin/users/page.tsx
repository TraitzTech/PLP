'use client'

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Search, Filter, Plus, CreditCard as Edit, Trash2, Shield, ShieldCheck, Ban, Mail, Phone, MapPin, Calendar, MoveHorizontal as MoreHorizontal, Eye, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';

// Mock users data
const mockUsers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+237 6XX XXX XXX',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    userType: 'customer',
    status: 'active',
    verified: true,
    joinedDate: '2023-06-15',
    lastLogin: '2024-02-15T10:30:00Z',
    totalBookings: 12,
    totalSpent: 7200000,
    location: 'Yaoundé, Cameroon',
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+237 6XX XXX XXY',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    userType: 'owner',
    status: 'active',
    verified: true,
    joinedDate: '2023-03-20',
    lastLogin: '2024-02-14T15:45:00Z',
    totalProperties: 5,
    totalRevenue: 15600000,
    location: 'Douala, Cameroon',
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@example.com',
    phone: '+237 6XX XXX XXZ',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    userType: 'customer',
    status: 'suspended',
    verified: false,
    joinedDate: '2024-01-10',
    lastLogin: '2024-02-10T09:20:00Z',
    totalBookings: 3,
    totalSpent: 1800000,
    location: 'Bamenda, Cameroon',
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesType = userTypeFilter === 'all' || user.userType === userTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'owner':
        return 'bg-plp-purple/10 text-plp-purple';
      case 'customer':
        return 'bg-plp-pink/10 text-plp-pink';
      case 'admin':
        return 'bg-plp-yellow/10 text-black';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSuspendUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'suspended' ? 'active' : 'suspended' }
        : user
    ));
    toast.success('User status updated successfully');
  };

  const handleVerifyUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, verified: !user.verified }
        : user
    ));
    toast.success('User verification updated successfully');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    toast.success('User deleted successfully');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage all platform users, permissions, and verification status.</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Add a new user to the platform.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="First name" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Last name" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Email address" />
                </div>
                <div>
                  <Label htmlFor="userType">User Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="owner">Property Owner</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 btn-primary">Create User</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-plp-purple" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Property Owners</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.userType === 'owner').length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-plp-pink" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.status === 'suspended').length}
                  </p>
                </div>
                <UserX className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                  <SelectItem value="owner">Property Owners</SelectItem>
                  <SelectItem value="admin">Administrators</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </h3>
                        {user.verified && (
                          <ShieldCheck className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge className={getUserTypeColor(user.userType)}>
                          {user.userType}
                        </Badge>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-gray-600">Joined: {formatDate(user.joinedDate)}</p>
                      {user.userType === 'customer' && (
                        <p className="text-gray-600">
                          Spent: {formatCurrency(user.totalSpent || 0)}
                        </p>
                      )}
                      {user.userType === 'owner' && (
                        <p className="text-gray-600">
                          Revenue: {formatCurrency(user.totalRevenue || 0)}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyUser(user.id)}
                        className={user.verified ? 'text-yellow-600' : 'text-green-600'}
                      >
                        {user.verified ? <Shield className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuspendUser(user.id)}
                        className={user.status === 'suspended' ? 'text-green-600' : 'text-red-600'}
                      >
                        {user.status === 'suspended' ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information and permissions.</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="editFirstName">First Name</Label>
                    <Input id="editFirstName" defaultValue={selectedUser.firstName} />
                  </div>
                  <div>
                    <Label htmlFor="editLastName">Last Name</Label>
                    <Input id="editLastName" defaultValue={selectedUser.lastName} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="editEmail">Email</Label>
                  <Input id="editEmail" type="email" defaultValue={selectedUser.email} />
                </div>
                <div>
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input id="editPhone" defaultValue={selectedUser.phone} />
                </div>
                <div>
                  <Label htmlFor="editUserType">User Type</Label>
                  <Select defaultValue={selectedUser.userType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="owner">Property Owner</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 btn-primary">Save Changes</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}