'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, ThumbsUp, Flag, MessageSquare, Filter } from 'lucide-react';

interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  rating: number;
  date: string;
  comment: {
    en: string;
    fr: string;
  };
  helpful: number;
  images?: string[];
  hostResponse?: {
    en: string;
    fr: string;
    date: string;
  };
}

interface PropertyReviewsProps {
  reviews: Review[];
  language: string;
  propertyRating: number;
  totalReviews: number;
}

export function PropertyReviews({ reviews, language, propertyRating, totalReviews }: PropertyReviewsProps) {
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');

  const content = {
    en: {
      title: "Guest Reviews",
      rating: "Rating",
      reviews: "reviews",
      sortBy: "Sort by",
      filterBy: "Filter by rating",
      sortOptions: {
        newest: "Newest first",
        oldest: "Oldest first",
        highest: "Highest rated",
        lowest: "Lowest rated",
        helpful: "Most helpful"
      },
      filterOptions: {
        all: "All ratings",
        5: "5 stars",
        4: "4 stars",
        3: "3 stars",
        2: "2 stars",
        1: "1 star"
      },
      helpful: "Helpful",
      report: "Report",
      hostResponse: "Host response",
      verified: "Verified guest"
    },
    fr: {
      title: "Avis des Clients",
      rating: "Note",
      reviews: "avis",
      sortBy: "Trier par",
      filterBy: "Filtrer par note",
      sortOptions: {
        newest: "Plus récent",
        oldest: "Plus ancien",
        highest: "Mieux noté",
        lowest: "Moins bien noté",
        helpful: "Plus utile"
      },
      filterOptions: {
        all: "Toutes les notes",
        5: "5 étoiles",
        4: "4 étoiles",
        3: "3 étoiles",
        2: "2 étoiles",
        1: "1 étoile"
      },
      helpful: "Utile",
      report: "Signaler",
      hostResponse: "Réponse de l'hôte",
      verified: "Client vérifié"
    }
  };

  const currentContent = content[language as keyof typeof content];

  // Filter and sort reviews
  const filteredReviews = reviews.filter(review => {
    if (filterRating === 'all') return true;
    return review.rating === parseInt(filterRating);
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful - a.helpful;
      default: // newest
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => r.rating === rating).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            {currentContent.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {propertyRating}
              </div>
              <div className="flex items-center justify-center mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(propertyRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600">
                {totalReviews} {currentContent.reviews}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-8">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={currentContent.sortBy} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(currentContent.sortOptions).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder={currentContent.filterBy} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(currentContent.filterOptions).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={review.user.avatar} />
                      <AvatarFallback>
                        {review.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                        {review.user.verified && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {currentContent.verified}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <Flag className="w-4 h-4" />
                  </Button>
                </div>

                {/* Review Content */}
                <div>
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment[language as keyof typeof review.comment]}
                  </p>
                </div>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}

                {/* Host Response */}
                {review.hostResponse && (
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-plp-purple">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-plp-purple" />
                      <span className="font-medium text-gray-900">{currentContent.hostResponse}</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.hostResponse.date)}
                      </span>
                    </div>
                    <p className="text-gray-700">
                      {review.hostResponse[language as keyof typeof review.hostResponse]}
                    </p>
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {currentContent.helpful} ({review.helpful})
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <Flag className="w-4 h-4 mr-2" />
                    {currentContent.report}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedReviews.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === 'fr' ? 'Aucun avis trouvé' : 'No reviews found'}
            </h3>
            <p className="text-gray-600">
              {language === 'fr' 
                ? 'Ajustez vos filtres pour voir plus d\'avis.'
                : 'Adjust your filters to see more reviews.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}