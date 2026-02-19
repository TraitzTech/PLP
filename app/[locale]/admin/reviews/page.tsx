"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Star,
  Search,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Loader2,
  Eye,
  Trash2,
  MessageSquare,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { toast } from 'sonner';
import { adminReviewService, type Review, type ReviewStatistics } from "@/services/reviewService";
import { TableLoader } from "@/components/ui/shimmer-loaders";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);
  
  // Statistics
  const [stats, setStats] = useState<ReviewStatistics>({
    total_reviews: 0,
    pending_reviews: 0,
    approved_reviews: 0,
    average_rating: 0,
    reviews_today: 0,
    reviews_this_week: 0,
    reviews_this_month: 0,
    rating_distribution: {},
  });

  // Review actions
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        per_page: perPage,
        page: currentPage,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await adminReviewService.getAllReviews(params);
      setReviews(response.data || []);
      if (response.meta) {
        setTotalPages(response.meta.last_page || 1);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch reviews"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminReviewService.getStatistics();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch review statistics:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [currentPage, statusFilter]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchReviews();
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleApprove = async (reviewId: number) => {
    try {
      setIsProcessing(true);
      await adminReviewService.approveReview(reviewId);
      toast.success("Review approved successfully");
      fetchReviews();
      fetchStats();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to approve review"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReview) return;

    try {
      setIsProcessing(true);
      await adminReviewService.rejectReview(selectedReview.id, rejectReason || undefined);
      toast.success("Review rejected");
      setShowRejectDialog(false);
      setSelectedReview(null);
      setRejectReason("");
      fetchReviews();
      fetchStats();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to reject review"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    try {
      setIsProcessing(true);
      await adminReviewService.deleteReview(selectedReview.id);
      toast.success("Review deleted successfully");
      setShowDeleteDialog(false);
      setSelectedReview(null);
      fetchReviews();
      fetchStats();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete review"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (review: Review) => {
    if (review.is_approved) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <Clock className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Review Management</h1>
            <p className="text-muted-foreground">
              Manage and moderate property reviews
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_reviews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved_reviews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending_reviews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.average_rating ? stats.average_rating.toFixed(1) : '0.0'}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              All Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, property, or comment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-8"
                />
              </div>
              <Button onClick={handleSearch} variant="secondary">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <TableLoader rows={10} columns={7} />
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-muted-foreground">No reviews found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="max-w-[300px]">Comment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium">
                            {review.user?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {review.listing?.title || `Property #${review.listing_id}`}
                            </span>
                          </TableCell>
                          <TableCell>{renderStars(review.rating)}</TableCell>
                          <TableCell className="max-w-[300px]">
                            <p className="text-sm text-gray-600 truncate">
                              {review.comment}
                            </p>
                          </TableCell>
                          <TableCell>{getStatusBadge(review)}</TableCell>
                          <TableCell>
                            {new Date(review.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedReview(review);
                                    setShowViewDialog(true);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {!review.is_approved && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleApprove(review.id)}
                                      className="text-green-600"
                                    >
                                      <ThumbsUp className="mr-2 h-4 w-4" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedReview(review);
                                        setShowRejectDialog(true);
                                      }}
                                      className="text-orange-600"
                                    >
                                      <ThumbsDown className="mr-2 h-4 w-4" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedReview(review);
                                    setShowDeleteDialog(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Review Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Full details of the review submission
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">User</p>
                  <p className="text-sm">{selectedReview.user?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm">{selectedReview.user?.email || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Property</p>
                <p className="text-sm">{selectedReview.listing?.title || `Property #${selectedReview.listing_id}`}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Rating</p>
                <div className="flex items-center gap-2">
                  {renderStars(selectedReview.rating)}
                  <span className="text-sm">({selectedReview.rating}/5)</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Comment</p>
                <p className="text-sm bg-gray-50 p-3 rounded-md mt-1">
                  {selectedReview.comment}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  {getStatusBadge(selectedReview)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submitted</p>
                  <p className="text-sm">
                    {new Date(selectedReview.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedReview.admin_notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Admin Notes</p>
                  <p className="text-sm bg-yellow-50 p-3 rounded-md mt-1">
                    {selectedReview.admin_notes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {selectedReview && !selectedReview.is_approved && (
              <Button
                onClick={() => handleApprove(selectedReview.id)}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Approve
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Review Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Review</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this review. The user will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Rejection Reason (optional)</label>
              <Textarea
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ThumbsDown className="mr-2 h-4 w-4" />
              )}
              Reject Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedReview(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
