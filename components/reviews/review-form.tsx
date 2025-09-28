'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewFormProps {
  propertyTitle: string;
  language: string;
  onSubmit: (reviewData: any) => void;
  onCancel: () => void;
}

export function ReviewForm({ propertyTitle, language, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const content = {
    en: {
      title: "Write a Review",
      subtitle: "Share your experience with",
      ratingLabel: "Overall Rating",
      commentLabel: "Your Review",
      commentPlaceholder: "Tell others about your experience at this property...",
      photosLabel: "Add Photos (Optional)",
      photosDescription: "Share photos from your stay",
      submit: "Submit Review",
      cancel: "Cancel",
      ratingRequired: "Please select a rating",
      commentRequired: "Please write a review",
      success: "Thank you for your review! It will be published after moderation.",
      ratingDescriptions: [
        "Terrible",
        "Poor", 
        "Average",
        "Good",
        "Excellent"
      ]
    },
    fr: {
      title: "Écrire un Avis",
      subtitle: "Partagez votre expérience avec",
      ratingLabel: "Note Globale",
      commentLabel: "Votre Avis",
      commentPlaceholder: "Parlez aux autres de votre expérience dans cette propriété...",
      photosLabel: "Ajouter des Photos (Optionnel)",
      photosDescription: "Partagez des photos de votre séjour",
      submit: "Soumettre l'Avis",
      cancel: "Annuler",
      ratingRequired: "Veuillez sélectionner une note",
      commentRequired: "Veuillez écrire un avis",
      success: "Merci pour votre avis! Il sera publié après modération.",
      ratingDescriptions: [
        "Terrible",
        "Médiocre",
        "Moyen", 
        "Bon",
        "Excellent"
      ]
    }
  };

  const currentContent = content[language as keyof typeof content];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error(currentContent.ratingRequired);
      return;
    }
    
    if (!comment.trim()) {
      toast.error(currentContent.commentRequired);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(currentContent.success);
      onSubmit({
        rating,
        comment,
        photos,
        language
      });
    }, 2000);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          {currentContent.title}
        </CardTitle>
        <p className="text-gray-600">
          {currentContent.subtitle} <span className="font-medium">{propertyTitle}</span>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{currentContent.ratingLabel}</Label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, index) => {
                const starValue = index + 1;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        starValue <= (hoverRating || rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                );
              })}
              {(hoverRating || rating) > 0 && (
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {currentContent.ratingDescriptions[(hoverRating || rating) - 1]}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base font-medium">
              {currentContent.commentLabel}
            </Label>
            <Textarea
              id="comment"
              rows={6}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={currentContent.commentPlaceholder}
              className="resize-none"
            />
          </div>

          {/* Photos */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{currentContent.photosLabel}</Label>
            <p className="text-sm text-gray-600">{currentContent.photosDescription}</p>
            
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <Button type="button" variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              {language === 'fr' ? 'Télécharger des Photos' : 'Upload Photos'}
            </Button>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              {currentContent.cancel}
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {language === 'fr' ? 'Envoi...' : 'Submitting...'}
                </>
              ) : (
                currentContent.submit
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}