'use client'

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { PropertyCard } from '@/components/properties/property-card';
import { PropertyReviews } from '@/components/reviews/property-reviews';
import { PropertyMap } from '@/components/properties/property-map';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookingPaymentModal } from './booking-payment-modal';
import apiClient from "@/lib/apiClient";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import {
  Star,
  Heart,
  Share2,
  Bed,
  Bath,
  Square,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MessageSquare,
  MapPin,
  Home,
  Building2,
  Ruler,
  Zap,
  Loader2,
  Send,
  CheckCircle, ShieldCheck
} from 'lucide-react';
import { 
  getPropertyTypeSummary, 
  getPropertyPurposeBadges, 
  formatPrice,
  getPriceLabel,
  getPriceContext,
  isHouseProperty,
  isLandProperty,
  isHotelProperty
} from '@/lib/propertyHelpers';
import { bookingService, type CreateBookingRequest, type GuestBookingRequest } from '@/services/bookingService';
import { reviewService, type CreateReviewRequest } from '@/services/reviewService';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/authService';
import { savedPropertyService } from '@/services/savedPropertyService';
import { platformAccessService } from '@/services/platformAccessService';

interface PropertyDetailsClientProps {
  property: any;
  similarProperties: any[];
  reviews: any[];
  language?: string;
}

// Local type for API reviews
interface ApiReview {
  id: number;
  user_id: number | null;
  guest_name?: string;
  guest_email?: string;
  is_guest_review?: boolean;
  listing_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
  };
}

// Type for display reviews (what PropertyReviews component expects)
interface DisplayReview {
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
}

export function PropertyDetailsClient({ property, similarProperties, reviews: initialReviews, language = 'en' }: PropertyDetailsClientProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isManuallyNavigating, setIsManuallyNavigating] = useState(false);
  const manualNavTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState(2);
  const [isFavorite, setIsFavorite] = useState(Boolean(property?.is_saved));
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  // Authentication and guest booking state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUserType, setCurrentUserType] = useState<string | null>(null);
  const [bookingMode, setBookingMode] = useState<'choose' | 'guest' | 'login'>('guest');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [platformFeeXaf, setPlatformFeeXaf] = useState(0);
  const [platformFeeCurrency, setPlatformFeeCurrency] = useState('XAF');
  const [unlockingAgent, setUnlockingAgent] = useState(false);
  const [agentUnlockedOverride, setAgentUnlockedOverride] = useState(false);
  const [agentAccessStatus, setAgentAccessStatus] = useState<{
    can_contact: boolean;
    has_booking: boolean;
    has_paid_access: boolean;
    reason: string | null;
  } | null>(null);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentChannel, setPaymentChannel] = useState('MTN');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [publicSettings, setPublicSettings] = useState<any>(null);
  const paySectionRef = useRef<HTMLDivElement | null>(null);
  
  // Review state
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({});
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewGuestName, setReviewGuestName] = useState('');
  const [reviewGuestEmail, setReviewGuestEmail] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const agent = property?.agent;
  const agentId = Number(property?.agent_id ?? agent?.id ?? 0) || null;
  const agentUserId = Number(agent?.user?.id ?? 0) || null;
  const canViewAgent = Boolean(property?.can_view_agent);
  const hasUnlockedAgent = canViewAgent || agentUnlockedOverride || Boolean(agentAccessStatus?.has_paid_access);

  // Fetch reviews on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await reviewService.getListingReviews(property.id, { per_page: 20 });
        setReviews(response.data);
        setAverageRating(response.meta.average_rating || 0);
        setTotalReviews(response.meta.total);
        setRatingDistribution(response.meta.rating_distribution || {});
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        // Fallback to initial reviews if API fails
        setReviews(initialReviews || []);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (property?.id) {
      fetchReviews();
    }
  }, [property?.id, initialReviews]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthed = await authService.isAuthenticated();
        setIsAuthenticated(isAuthed);
        if (isAuthed) {
          setBookingMode('guest'); // If authenticated, skip the choose step
          const user = await authService.getCurrentUser();
          setCurrentUserType((user as any)?.user_type || null);
          if ((user as any)?.phone) {
            setPaymentPhone((user as any).phone);
          }
        } else {
          setCurrentUserType(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setCurrentUserType(null);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const loadPlatformFee = async () => {
      try {
        const res = await platformAccessService.getFeeConfig();
        setPlatformFeeXaf(res.data.platform_fee_xaf || 0);
        setPlatformFeeCurrency(res.data.currency || 'XAF');
        if ((res.data.platform_fee_xaf || 0) <= 0) {
          setAgentUnlockedOverride(true);
          setAgentAccessStatus((prev) => ({
            can_contact: true,
            has_booking: true,
            has_paid_access: true,
            reason: null,
            ...prev,
          }));
        }
      } catch (error) {
        console.error('Failed to load platform fee config', error);
      }
    };

    loadPlatformFee();
  }, []);

  useEffect(() => {
    const loadPlatformAccess = async () => {
      if (!agentId || !isAuthenticated || currentUserType !== 'customer') {
        return;
      }

      try {
        const [feeRes, accessRes] = await Promise.all([
          platformAccessService.getFeeConfig(),
          platformAccessService.getStatus(agentId),
        ]);
        setPlatformFeeXaf(feeRes.data.platform_fee_xaf || 0);
        setAgentAccessStatus({
          can_contact: accessRes.data.can_contact,
          has_booking: accessRes.data.has_booking,
          has_paid_access: accessRes.data.has_paid_access,
          reason: accessRes.data.reason,
        });
        if (accessRes.data.has_paid_access) {
          setAgentUnlockedOverride(true);
        }
      } catch (error) {
        console.error('Failed to load platform access status', error);
      }
    };

    loadPlatformAccess();
  }, [agentId, isAuthenticated, currentUserType]);

  useEffect(() => {
    setIsFavorite(Boolean(property?.is_saved));
  }, [property?.is_saved]);

  const getLocaleFromPath = () => {
    const segments = pathname.split('/').filter(Boolean);
    const locale = segments[0];
    return locale === 'en' || locale === 'fr' ? locale : 'en';
  };

  const handleToggleSave = async () => {
    if (isSavingFavorite) {
      return;
    }

    const isAuthed = await authService.isAuthenticated();
    if (!isAuthed) {
      const locale = getLocaleFromPath();
      toast.error('Please sign in to save properties');
      router.push(`/${locale}/auth/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsSavingFavorite(true);
    const previousValue = isFavorite;
    setIsFavorite(!previousValue);

    try {
      if (previousValue) {
        await savedPropertyService.removeSavedProperty(property.id);
        toast.success('Removed from saved properties');
      } else {
        await savedPropertyService.saveProperty(property.id);
        toast.success('Property saved');
      }
    } catch (error) {
      setIsFavorite(previousValue);
      toast.error('Failed to update saved properties');
    } finally {
      setIsSavingFavorite(false);
    }
  };

  const getShareUrl = () => {
    const locale = getLocaleFromPath();
    const path = pathname?.startsWith(`/${locale}/`) ? pathname : `/${locale}${pathname?.startsWith('/') ? '' : '/'}${pathname || ''}`;
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}${path}`;
    }
    return path;
  };

  const copyToClipboard = async (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const handleShare = async () => {
    try {
      const url = getShareUrl();
      const formatted = formatPrice(property.price);

      const purposeLines: string[] = [];
      if (isForRent) purposeLines.push(`For rent: ${formatted} / month`);
      if (isForSale) purposeLines.push(`For sale: ${formatted}`);
      if (purposeLines.length === 0) purposeLines.push(`Price: ${formatted}`);

      const rawDescription = String((property as any)?.description ?? '').replace(/\s+/g, ' ').trim();
      const shortDescription =
        rawDescription.length > 0
          ? rawDescription.length > 160
            ? `${rawDescription.slice(0, 160)}…`
            : rawDescription
          : '';

      const locationLine = [property.city, property.region].filter(Boolean).join(', ') || property.location || '';

      const message = [
        property.title,
        locationLine,
        ...purposeLines,
        shortDescription ? `\n${shortDescription}` : '',
        `\nView: ${url}`,
      ]
        .filter((line) => typeof line === 'string' && line.trim().length > 0)
        .join('\n');

      await copyToClipboard(message);
      toast.success('Share message copied to clipboard');
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Failed to copy share message');
    }
  };

  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext x='50%25' y='50%25' font-size='24' text-anchor='middle' dy='.3em' fill='%23999'%3EImage coming soon%3C/text%3E%3C/svg%3E";
  const images = property?.images?.length ? property.images : [placeholderImage];
  const videos: string[] = Array.isArray(property?.videos) ? property.videos.filter(Boolean) : [];
  // Use facilities objects if available, otherwise fallback to amenities strings
  const facilities = property?.facilities && Array.isArray(property.facilities) && property.facilities.length > 0
    ? property.facilities
    : (property?.amenities || []).map((name: string) => ({ name }));
  const handleImageNavigation = () => {
    setIsManuallyNavigating(true);
    
    // Clear existing timeout
    if (manualNavTimeoutRef.current) {
      clearTimeout(manualNavTimeoutRef.current);
    }
    
    // Resume auto-scroll after 8 seconds of manual navigation
    manualNavTimeoutRef.current = setTimeout(() => {
      setIsManuallyNavigating(false);
    }, 8000);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
    handleImageNavigation();
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
    handleImageNavigation();
  };

  const jumpToImage = (index: number) => {
    setCurrentImageIndex(index);
    handleImageNavigation();
  };

  // Auto-advance gallery images every few seconds (only when not manually navigating)
  useEffect(() => {
    if (images.length <= 1) return;
    if (typeof window === "undefined") return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduce-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    // Only set interval if not manually navigating
    if (isManuallyNavigating) return;

    // Reset to first image when the image set changes
    setCurrentImageIndex(0);

    const intervalId = window.setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length, isManuallyNavigating]);

  // Cleanup manual navigation timeout on unmount
  useEffect(() => {
    return () => {
      if (manualNavTimeoutRef.current) {
        clearTimeout(manualNavTimeoutRef.current);
      }
    };
  }, []);

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights * property.price;
  };

  // Normalize boolean values (handles 0, 1, true, false, string "1", "true")
  const normalizeBoolean = (value: any): boolean => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") return value.toLowerCase() === "true" || value === "1";
    return false;
  };

  // Determine if property is for rent or sale
  const isForRent = normalizeBoolean(property.for_rent);
  const isForSale = normalizeBoolean(property.for_purchase);
  const isBothRentAndSale = isForRent && isForSale;
  const isHotelListing = isHotelProperty(property);

  const getPrimaryActionLabel = () => {
    if (isHotelListing) return isAuthenticated ? 'Book Now' : 'Book as Guest';
    if (isForRent && !isForSale) return isAuthenticated ? 'Secure Rental' : 'Rent as Guest';
    if (isForSale && !isForRent) return 'Secure Property';
    if (isBothRentAndSale) return 'Secure Property';
    return isAuthenticated ? 'Continue' : 'Submit Request';
  };

  console.log(
    "Property Object - for_rent:", property.for_rent, "for_purchase:", property.for_purchase,
    "isForRent:", isForRent, "isForSale:", isForSale,
    "Full property:", property
  )

  useEffect(() => {
    const fetchPublicSettings = async () => {
      try {
        const response = await apiClient.get('/public/settings');
        setPublicSettings(response.data.data);
      } catch (error) {
        console.error('Failed to fetch public settings:', error);
      }
    };
    fetchPublicSettings();
  }, []);

  const handleBooking = async () => {
    // Default dates for non-rental (sale/offer) flows so booking can proceed
    const effectiveCheckIn = checkIn ?? new Date();
    const effectiveCheckOut = checkOut ?? addDays(new Date(), 1);

    if (!effectiveCheckIn || !effectiveCheckOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    if (effectiveCheckIn >= effectiveCheckOut) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    // Validate guest details if not authenticated
    if (!isAuthenticated) {
      if (!guestName.trim()) {
        toast.error('Please enter your name');
        return;
      }
      if (!guestEmail.trim()) {
        toast.error('Please enter your email');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        toast.error('Please enter a valid email address');
        return;
      }
      if (!guestPhone.trim()) {
        toast.error('Please enter your phone number');
        return;
      }
    }

    // Check if payment is required
    const isFreeMode = publicSettings?.customer_booking_free_mode === true;
    const feeEnabled = publicSettings?.customer_platform_access_fee_enabled === true;
    const feeAmount = publicSettings?.platform_fee_xaf || 0;

    const paymentRequired = !isFreeMode && feeEnabled && feeAmount > 0 && !hasUnlockedAgent;

    if (paymentRequired) {
      setShowPaymentModal(true);
      return;
    }

    // If no payment required, proceed with booking
    await executeBooking();
  };

  const normalizeWhatsappPhone = (rawPhone?: string): string | null => {
    if (!rawPhone) return null;
    const digits = rawPhone.replace(/\D/g, '');
    if (!digits) return null;

    // Cameroon local numbers are commonly stored as 9 digits; prepend country code.
    if (digits.length === 9) {
      return `237${digits}`;
    }

    if (digits.startsWith('00')) {
      return digits.slice(2);
    }

    return digits;
  };

  const redirectToAgentWhatsapp = (bookingData: any) => {
    const agentPhoneRaw =
      bookingData?.listing?.agent?.user?.phone ||
      property?.agent?.user?.phone ||
      property?.agent?.phone ||
      null;

    const agentPhone = normalizeWhatsappPhone(agentPhoneRaw);
    if (!agentPhone) {
      return false;
    }

    const propertyTitle = bookingData?.listing?.title || property?.title || 'Property';
    const propertyCity = bookingData?.listing?.city || property?.city || 'Cameroon';
    const checkInValue = bookingData?.check_in_date || format(checkIn ?? new Date(), 'yyyy-MM-dd');
    const checkOutValue = bookingData?.check_out_date || format(checkOut ?? addDays(new Date(), 1), 'yyyy-MM-dd');
    const guestCount = bookingData?.guest_count || guests;
    const customerName = isAuthenticated ? 'Customer' : guestName.trim() || 'Guest';
    const bookingId = bookingData?.id;

    // English version of the message
    const messageEN = [
      `Hello, I just made a booking on PLP for: ${propertyTitle}`,
      `City: ${propertyCity}`,
      `Check-in: ${checkInValue}`,
      `Check-out: ${checkOutValue}`,
      `Guests: ${guestCount}`,
      bookingId ? `Booking ID: #${bookingId}` : null,
      `Name: ${customerName}`,
      'Please let me know the next steps. Thank you.',
    ]
      .filter(Boolean)
      .join('\n');

    // French version of the message
    const messageFR = [
      `Bonjour, je viens de faire une réservation sur PLP pour: ${propertyTitle}`,
      `Ville: ${propertyCity}`,
      `Entrée: ${checkInValue}`,
      `Sortie: ${checkOutValue}`,
      `Nombre de clients: ${guestCount}`,
      bookingId ? `ID de réservation: #${bookingId}` : null,
      `Nom: ${customerName}`,
      'Veuillez me informer des prochaines étapes. Merci.',
    ]
      .filter(Boolean)
      .join('\n');

    // Combine both versions with language separator
    const message = `${messageEN}\n\n---\n\n${messageFR}`;

    const whatsappUrl = `https://wa.me/${agentPhone}?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
    return true;
  };

  const executeBooking = async (paymentDetails?: any) => {
    const effectiveCheckIn = checkIn ?? new Date();
    const effectiveCheckOut = checkOut ?? addDays(new Date(), 1);

    setIsBooking(true);
    try {
      let bookingResponse;
      if (isAuthenticated) {
        // Authenticated user booking
        bookingResponse = await bookingService.createBooking({
          listing_id: property.id,
          check_in_date: format(effectiveCheckIn, 'yyyy-MM-dd'),
          check_out_date: format(effectiveCheckOut, 'yyyy-MM-dd'),
          guest_count: guests,
          special_requests: specialRequests || undefined,
          payment_id: paymentDetails?.id,
        });
      } else {
        // Guest booking
        bookingResponse = await bookingService.createGuestBooking({
          listing_id: property.id,
          check_in_date: format(effectiveCheckIn, 'yyyy-MM-dd'),
          check_out_date: format(effectiveCheckOut, 'yyyy-MM-dd'),
          guest_count: guests,
          guest_name: guestName.trim(),
          guest_email: guestEmail.trim(),
          guest_phone: guestPhone.trim(),
          special_requests: specialRequests || undefined,
          payment_id: paymentDetails?.id,
        });
      }

      setBookingSuccess(true);
      toast.success('Booking submitted successfully. Redirecting to WhatsApp chat with the agent...');

      // Redirect immediately to WhatsApp so agents receive booking details quickly.
      const redirected = redirectToAgentWhatsapp(bookingResponse?.data);
      if (!redirected) {
        toast.info('Booking submitted. Confirmation email has been sent. Agent phone is unavailable for WhatsApp redirect.');
      }
      
      // Reset form after success
      setTimeout(() => {
        setBookingSuccess(false);
        setSpecialRequests('');
        setGuestName('');
        setGuestEmail('');
        setGuestPhone('');
        setBookingMode('choose');
      }, 3000);
    } catch (error: any) {
      console.error('Booking error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit booking. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsBooking(false);
    }
  };

  const handleUnlockAgent = async () => {
    if (!agentId) {
      toast.error('Agent information is not available for this listing.');
      return;
    }

    if (!isAuthenticated) {
      const locale = getLocaleFromPath();
      router.push(`/${locale}/auth/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (currentUserType !== 'customer') {
      toast.error('Only customer accounts can unlock agent contact details.');
      return;
    }

    if (!paymentPhone.trim()) {
      toast.error('Enter the mobile money number to charge for the platform fee.');
      return;
    }

    setUnlockingAgent(true);
    try {
      const response = await platformAccessService.pay({
        agent_id: agentId,
        payment_channel: paymentChannel,
        phone_number: paymentPhone.trim(),
      });
      toast.success(response.message || 'Platform fee paid successfully. A receipt has been emailed to you.');
      setAgentUnlockedOverride(true);
      setAgentAccessStatus((prev) => ({
        can_contact: true,
        has_booking: prev?.has_booking ?? true,
        has_paid_access: true,
        reason: null,
      }));
    } catch (error: any) {
      toast.error(error?.message || 'Failed to process platform fee payment.');
    } finally {
      setUnlockingAgent(false);
    }
  };

  const handleContactAgent = async () => {
    if (!agentUserId) {
      toast.error('Agent information is not available for this listing.');
      return;
    }

    if (!isAuthenticated) {
      const locale = getLocaleFromPath();
      router.push(`/${locale}/auth/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (currentUserType === 'customer' && !hasUnlockedAgent) {
      if (!agentAccessStatus?.has_booking) {
        toast.error('You need an active booking with this agent before starting a chat.');
      } else {
        toast.error('Pay the platform fee to unlock chat with this agent.');
      }
      return;
    }

    const locale = getLocaleFromPath();
    const inboxPath =
      currentUserType === 'admin'
        ? `/${locale}/admin/messages`
        : currentUserType === 'agent'
          ? `/${locale}/dashboard/agent/messages`
          : `/${locale}/dashboard/messages`;

    router.push(inboxPath);
  };

  // Handle review submission
  const handleReviewSubmit = async () => {
    if (!reviewComment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    if (reviewComment.trim().length < 10) {
      toast.error('Review must be at least 10 characters long');
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      toast.error('Please select a rating between 1 and 5');
      return;
    }

    // Validate guest info if not authenticated
    if (!isAuthenticated) {
      if (!reviewGuestName.trim()) {
        toast.error('Please enter your name');
        return;
      }
      if (!reviewGuestEmail.trim()) {
        toast.error('Please enter your email');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewGuestEmail)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    setIsSubmittingReview(true);
    try {
      if (isAuthenticated) {
        // Authenticated user review
        await reviewService.createReview({
          listing_id: property.id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        });
      } else {
        // Guest review
        await reviewService.createGuestReview({
          listing_id: property.id,
          rating: reviewRating,
          comment: reviewComment.trim(),
          guest_name: reviewGuestName.trim(),
          guest_email: reviewGuestEmail.trim(),
        });
      }

      toast.success('Review submitted successfully! It will be visible after admin approval.');
      setShowReviewDialog(false);
      setReviewRating(5);
      setReviewComment('');
      setReviewGuestName('');
      setReviewGuestEmail('');
    } catch (error: any) {
      console.error('Review error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <>
      <BookingPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={publicSettings?.platform_fee_xaf || 0}
        currency={publicSettings?.default_currency || "XAF"}
        guestInfo={!isAuthenticated ? {
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
        } : undefined}
        onSuccess={(paymentDetails) => {
          executeBooking(paymentDetails);
        }}
      />
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {property.title}
            </h1>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {getPropertyPurposeBadges(property).map((badge, index) => (
                <Badge key={index} className="bg-plp-purple text-white">
                  {badge}
                </Badge>
              ))}
              {property.is_approved && (
                <Badge className="bg-green-100 text-green-800">✓ Approved</Badge>
              )}
              {property.is_featured && (
                <Badge className="bg-blue-100 text-blue-800">⭐ Featured</Badge>
              )}
              {property.number_available > 0 && (
                <Badge className="bg-emerald-100 text-emerald-800">Available</Badge>
              )}
              {property.is_negotiable && (
                <Badge className="bg-amber-100 text-amber-800">Negotiable</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{property.rating}</span>
                <span className="ml-1">({property.reviews} reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSave}
              disabled={isSavingFavorite}
              className={isFavorite ? 'text-red-500 border-red-200' : ''}
            >
              <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="mb-8">
        <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden">
          <Image
            src={images[currentImageIndex]}
            alt={property.title}
            fill
            className="object-cover"
          />
          
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white hover:text-gray-900 z-10 rounded-full w-10 h-10 transition-all duration-200"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white hover:text-gray-900 z-10 rounded-full w-10 h-10 transition-all duration-200"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {images.map((_image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => jumpToImage(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    } hover:bg-white`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Videos */}
      {videos.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((src, index) => (
              <video
                key={index}
                src={src}
                controls
                preload="metadata"
                className="w-full rounded-2xl bg-black shadow-sm"
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Property Info */}
          <div>
            <div className="flex items-center gap-6 mb-4">
              <Badge variant="secondary" className="bg-plp-purple/10 text-plp-purple">
                {property.type}
              </Badge>
                {property.bedrooms && (
                <div className="flex items-center text-gray-600">
                  <Bed className="w-4 h-4 mr-1" />
                  {property.bedrooms} bedrooms
                </div>
              )}
                {property.bathrooms && (
                <div className="flex items-center text-gray-600">
                  <Bath className="w-4 h-4 mr-1" />
                  {property.bathrooms} bathrooms
                </div>
              )}
                {property.area && (
                <div className="flex items-center text-gray-600">
                  <Square className="w-4 h-4 mr-1" />
                  {property.area} sq ft
                </div>
              )}
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              {property.description}
            </p>

            {/* Purpose Badges */}
            <div className="flex flex-wrap gap-2">
              {getPropertyPurposeBadges(property).map((badge, index) => (
                <Badge key={index} className="bg-plp-purple text-white">
                  {badge}
                </Badge>
              ))}
              {property.is_negotiable && (
                <Badge className="bg-green-100 text-green-800">
                  💰 Negotiable Price
                </Badge>
              )}
            </div>

            {/* Property Type Specific Details */}
            {isHouseProperty(property) && (property.bedrooms || property.bathrooms || property.floor_area) && (
              <Card className="bg-blue-50 mt-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    House Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {property.bedrooms && (
                      <div className="flex items-center gap-2">
                        <Bed className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Bedrooms</p>
                          <p className="font-semibold">{property.bedrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-2">
                        <Bath className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Bathrooms</p>
                          <p className="font-semibold">{property.bathrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.floor_area && (
                      <div className="flex items-center gap-2">
                        <Square className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Floor Area</p>
                          <p className="font-semibold">
                            {property.floor_area} {property.floor_area_unit || 'sqm'}
                          </p>
                        </div>
                      </div>
                    )}
                    {property.year_built && (
                      <div>
                        <p className="text-sm text-gray-600">Year Built</p>
                        <p className="font-semibold">{property.year_built}</p>
                      </div>
                    )}
                  </div>
                  {property.house_type && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="text-sm text-gray-600">House Type</p>
                      <p className="font-semibold capitalize">{property.house_type.replace('-', ' ')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {isLandProperty(property) && (property.land_area || property.land_dimensions) && (
              <Card className="bg-green-50 border-green-200 mt-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="h-5 w-5" />
                    Land Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.land_area && (
                      <div>
                        <p className="text-sm text-gray-600">Land Area</p>
                        <p className="font-semibold text-lg">
                          {property.land_area} {property.land_area_unit || 'sqm'}
                        </p>
                      </div>
                    )}
                    {property.land_dimensions && (
                      <div>
                        <p className="text-sm text-gray-600">Dimensions</p>
                        <p className="font-semibold">{property.land_dimensions}</p>
                      </div>
                    )}
                  </div>
                  {property.zoning && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="text-sm text-gray-600">Zoning</p>
                      <Badge className="bg-green-600 text-white capitalize mt-1">
                        {property.zoning}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {isHotelProperty(property) && (property.rooms_count || property.star_rating) && (
              <Card className="bg-purple-50 border-purple-200 mt-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Hotel Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {property.rooms_count && (
                      <div>
                        <p className="text-sm text-gray-600">Rooms</p>
                        <p className="font-semibold text-lg">{property.rooms_count}</p>
                      </div>
                    )}
                    {property.star_rating && (
                      <div>
                        <p className="text-sm text-gray-600">Rating</p>
                        <p className="font-semibold flex items-center gap-1">
                          {property.star_rating}
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        </p>
                      </div>
                    )}
                    {property.has_restaurant !== null && property.has_restaurant !== undefined && (
                      <div>
                        <p className="text-sm text-gray-600">Restaurant</p>
                        <p className="font-semibold">{property.has_restaurant ? '✓ Yes' : '✗ No'}</p>
                      </div>
                    )}
                    {property.has_pool !== null && property.has_pool !== undefined && (
                      <div>
                        <p className="text-sm text-gray-600">Swimming Pool</p>
                        <p className="font-semibold">{property.has_pool ? '✓ Yes' : '✗ No'}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Facilities & Amenities ({facilities?.length || 0})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {facilities && facilities.length > 0 ? facilities.map((facility: any, idx: number) => (
                <div key={facility?.id || `facility-${idx}`} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 text-sm">{facility?.name || facility || 'Facility'}</span>
                </div>
              )) : (
                <p className="text-gray-600 col-span-2 md:col-span-3">No amenities listed yet.</p>
              )}
            </div>
          </div>

          {agent && (
            <Card>
              <CardHeader>
                <CardTitle>Agent Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasUnlockedAgent ? (
                  <>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={agent?.user?.avatar} alt={agent?.user?.name} />
                        <AvatarFallback>
                          {(agent?.user?.name || "A").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900">{agent?.user?.name || 'Agent'}</p>
                        <p className="text-gray-600 text-sm">Agent Name</p>
                      </div>
                    </div>
                    {agent?.user?.email && (
                      <div className="border-t pt-3">
                        <p className="text-gray-600 text-sm">Agent Email</p>
                        <p className="font-medium text-gray-900">{agent.user.email}</p>
                      </div>
                    )}
                    {agent?.user?.phone && (
                      <div className="border-t pt-3">
                        <p className="text-gray-600 text-sm">Agent Phone</p>
                        <p className="font-medium text-gray-900">{agent.user.phone}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div ref={paySectionRef} className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
                    <p className="font-semibold text-amber-900">Agent details are locked</p>
                    <p className="text-sm text-amber-800">
                      Platform access fee: {new Intl.NumberFormat('fr-CM', { style: 'currency', currency: platformFeeCurrency || 'XAF', minimumFractionDigits: 0 }).format(platformFeeXaf || 0)} (set by admin)
                    </p>
                    {agentAccessStatus?.reason && (
                      <p className="text-xs text-amber-700">{agentAccessStatus.reason}</p>
                    )}
                    {!isAuthenticated && (
                      <p className="text-sm text-amber-800">
                        Sign in and pay the platform fee after booking to unlock agent contact details.
                      </p>
                    )}
                    {isAuthenticated && currentUserType !== 'customer' && (
                      <p className="text-sm text-amber-800">
                        Only customer accounts with paid platform access can view agent contact details.
                      </p>
                    )}
                    {isAuthenticated && currentUserType === 'customer' && !agentAccessStatus?.has_paid_access && (
                      <div className="space-y-3 mt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs font-medium">Mobile money number</Label>
                            <Input
                              value={paymentPhone}
                              onChange={(e) => setPaymentPhone(e.target.value)}
                              placeholder="e.g. +237 6XX..."
                              className="mt-1 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Payment channel</Label>
                            <select
                              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                              value={paymentChannel}
                              onChange={(e) => setPaymentChannel(e.target.value)}
                            >
                              <option value="MTN">MTN MoMo</option>
                              <option value="ORANGE">Orange Money</option>
                              <option value="mobile_money">Other Mobile Money</option>
                            </select>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">We will charge this number via {paymentChannel} to unlock the agent contact for this booking.</p>
                        <Button onClick={handleUnlockAgent} disabled={unlockingAgent} className="w-full">
                          {unlockingAgent ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>Pay {new Intl.NumberFormat('fr-CM', { style: 'currency', currency: platformFeeCurrency || 'XAF', minimumFractionDigits: 0 }).format(platformFeeXaf || 0)} to unlock</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              {/* Comprehensive Property Details Grid */}
              <Card>
                <CardHeader>
                  <CardTitle>Complete Property Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Price Information */}
                    {property.price !== undefined && property.price !== null && (
                      <div className="p-4 bg-gradient-to-br from-plp-purple/5 to-plp-purple/10 rounded-lg border border-plp-purple/20">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Price</p>
                        <p className="text-2xl font-bold text-plp-purple">
                          {new Intl.NumberFormat('fr-CM', {
                            style: 'currency',
                            currency: 'XAF',
                            minimumFractionDigits: 0,
                          }).format(property.price || 0)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{getPriceContext(property).description}</p>
                      </div>
                    )}

                    {/* Bedrooms */}
                    {property.bedrooms && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Bedrooms</p>
                        <div className="flex items-center gap-2">
                          <Bed className="h-5 w-5 text-blue-600" />
                          <span className="text-2xl font-bold text-gray-900">{property.bedrooms}</span>
                        </div>
                      </div>
                    )}

                    {/* Bathrooms */}
                    {property.bathrooms && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Bathrooms</p>
                        <div className="flex items-center gap-2">
                          <Bath className="h-5 w-5 text-blue-600" />
                          <span className="text-2xl font-bold text-gray-900">{property.bathrooms}</span>
                        </div>
                      </div>
                    )}

                    {/* Floor Area */}
                    {property.floor_area && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Floor Area</p>
                        <div className="flex items-center gap-2">
                          <Square className="h-5 w-5 text-green-600" />
                          <div>
                            <span className="text-2xl font-bold text-gray-900">{property.floor_area}</span>
                            <span className="text-xs text-gray-600 ml-1">{property.floor_area_unit || 'sqm'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Land Area */}
                    {property.land_area && (
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Land Area</p>
                        <div className="flex items-center gap-2">
                          <Ruler className="h-5 w-5 text-amber-600" />
                          <div>
                            <span className="text-2xl font-bold text-gray-900">{property.land_area}</span>
                            <span className="text-xs text-gray-600 ml-1">{property.land_area_unit || 'sqm'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Year Built */}
                    {property.year_built && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Year Built</p>
                        <p className="text-2xl font-bold text-gray-900">{property.year_built}</p>
                      </div>
                    )}

                    {/* Rooms Count (Hotel) */}
                    {property.rooms_count && (
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Total Rooms</p>
                        <span className="text-2xl font-bold text-gray-900">{property.rooms_count}</span>
                      </div>
                    )}

                    {/* Star Rating (Hotel) */}
                    {property.star_rating && (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">Star Rating</p>
                        <div className="flex items-center gap-1">
                          {[...Array(property.star_rating)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Number Available */}
                    {property.number_available && (
                      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Available Units</p>
                        <p className="text-2xl font-bold text-emerald-700">{property.number_available}</p>
                      </div>
                    )}

                    {/* Discount Price */}
                    {property.discount_price && (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Discount Price</p>
                        <p className="text-2xl font-bold text-red-600">
                          {new Intl.NumberFormat('fr-CM', {
                            style: 'currency',
                            currency: 'XAF',
                            minimumFractionDigits: 0,
                          }).format(property.discount_price)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Address & Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Location Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {property.address && (
                    <div className="border-b pb-3 last:border-b-0">
                      <p className="text-gray-600 text-sm font-medium">Address</p>
                      <p className="text-gray-900 mt-1">{property.address}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    {property.city && (
                      <div>
                        <p className="text-gray-600 text-sm font-medium">City</p>
                        <p className="text-gray-900 font-semibold mt-1">{property.city}</p>
                      </div>
                    )}
                    {property.region && (
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Region</p>
                        <p className="text-gray-900 font-semibold mt-1">{property.region}</p>
                      </div>
                    )}
                    {property.location && (
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Location</p>
                        <p className="text-gray-900 font-semibold mt-1">{property.location}</p>
                      </div>
                    )}
                  </div>

                  {/* Coordinates */}
                  {(property.latitude || property.longitude) && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      {property.latitude && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Latitude</p>
                          <p className="text-sm font-mono text-gray-900">{property.latitude}</p>
                        </div>
                      )}
                      {property.longitude && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Longitude</p>
                          <p className="text-sm font-mono text-gray-900">{property.longitude}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {property.is_available !== undefined && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Status</p>
                        <Badge className={property.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {property.is_available ? "✓ Available" : "Not Available"}
                        </Badge>
                      </div>
                    )}
                    {property.is_negotiable && (
                      <div className="p-4 bg-amber-50 rounded-lg">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Negotiable</p>
                        <Badge className="bg-amber-100 text-amber-800">💰 Negotiable</Badge>
                      </div>
                    )}
                    {property.is_featured && (
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Featured</p>
                        <Badge className="bg-yellow-100 text-yellow-800">⭐ Featured</Badge>
                      </div>
                    )}
                    {property.is_approved && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">Approval</p>
                        <Badge className="bg-green-100 text-green-800">✓ Approved</Badge>
                      </div>
                    )}
                  </div>

                  {/* Purpose Information */}
                  <div className="border-t pt-4">
                    <p className="text-gray-600 text-sm font-medium mb-2">Available For</p>
                    <div className="flex flex-wrap gap-2">
                      {property.for_rent && (
                        <Badge className="bg-blue-100 text-blue-800">For Rent</Badge>
                      )}
                      {property.for_purchase && (
                        <Badge className="bg-emerald-100 text-emerald-800">For Sale</Badge>
                      )}
                      {!property.for_rent && !property.for_purchase && (
                        <Badge variant="outline">Purpose not specified</Badge>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="border-t pt-4 space-y-2 text-sm">
                    {property.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Listed On:</span>
                        <span className="font-medium text-gray-900">{new Date(property.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {property.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium text-gray-900">{new Date(property.updatedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {property.id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Property ID:</span>
                        <span className="font-medium text-gray-900">#{property.id}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="location">
              <Card>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Location Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {property.address && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm font-medium mb-1">Address</p>
                        <p className="text-gray-900 font-semibold">{property.address}</p>
                      </div>
                    )}
                    {property.city && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm font-medium mb-1">City</p>
                        <p className="text-gray-900 font-semibold">{property.city}</p>
                      </div>
                    )}
                    {property.region && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm font-medium mb-1">Region</p>
                        <p className="text-gray-900 font-semibold">{property.region}</p>
                      </div>
                    )}
                  </div>

                  {/* Google Map */}
                  {property.latitude && property.longitude ? (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Exact Location</h4>
                      <PropertyMap
                        latitude={property.latitude}
                        longitude={property.longitude}
                        title={property.title}
                        address={property.address || `${property.city}, ${property.region}`}
                        height="450px"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Location</h4>
                      <div className="p-6 bg-gray-50 rounded-lg text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">
                          {property.address || property.location || `${property.city}, ${property.region}`}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Exact coordinates not available
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews">
              {/* Write Review Button */}
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Customer Reviews</h3>
                  <p className="text-sm text-gray-600">
                    {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'} • {averageRating.toFixed(1)} average rating
                  </p>
                </div>
                <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-plp-purple hover:bg-plp-purple/90">
                      <Send className="w-4 h-4 mr-2" />
                      Write a Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Write a Review</DialogTitle>
                      <DialogDescription>
                        Share your experience with this property. Your review will be visible after admin approval.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Guest Info (only for non-authenticated users) */}
                      {!isAuthenticated && !checkingAuth && (
                        <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-medium text-gray-700">Your Information</p>
                          <div>
                            <Label htmlFor="review-guest-name" className="text-xs font-medium">Name *</Label>
                            <Input
                              id="review-guest-name"
                              type="text"
                              placeholder="Your name"
                              value={reviewGuestName}
                              onChange={(e) => setReviewGuestName(e.target.value)}
                              className="mt-1 text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="review-guest-email" className="text-xs font-medium">Email *</Label>
                            <Input
                              id="review-guest-email"
                              type="email"
                              placeholder="your@email.com"
                              value={reviewGuestEmail}
                              onChange={(e) => setReviewGuestEmail(e.target.value)}
                              className="mt-1 text-sm"
                            />
                          </div>
                        </div>
                      )}

                      {/* Star Rating */}
                      <div>
                        <Label className="text-sm font-medium">Your Rating</Label>
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-8 h-8 transition-colors ${
                                  star <= reviewRating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {reviewRating === 5 ? 'Excellent' : reviewRating === 4 ? 'Very Good' : reviewRating === 3 ? 'Good' : reviewRating === 2 ? 'Fair' : 'Poor'}
                        </p>
                      </div>
                      
                      {/* Review Comment */}
                      <div>
                        <Label htmlFor="review-comment" className="text-sm font-medium">Your Review</Label>
                        <Textarea
                          id="review-comment"
                          placeholder="Tell us about your experience with this property (minimum 10 characters)..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="mt-2 min-h-[120px]"
                        />
                        <p className="text-xs text-gray-500 mt-1">{reviewComment.length} / 10 minimum characters</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleReviewSubmit}
                        disabled={
                          isSubmittingReview || 
                          !reviewComment.trim() || 
                          reviewComment.trim().length < 10 ||
                          (!isAuthenticated && (!reviewGuestName.trim() || !reviewGuestEmail.trim()))
                        }
                        className="bg-plp-purple hover:bg-plp-purple/90"
                      >
                        {isSubmittingReview ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Review
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Reviews Loading State */}
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-plp-purple" />
                  <span className="ml-2 text-gray-600">Loading reviews...</span>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-1">No reviews yet</h4>
                  <p className="text-gray-600 mb-4">Be the first to share your experience!</p>
                  <Button 
                    onClick={() => setShowReviewDialog(true)}
                    className="bg-plp-purple hover:bg-plp-purple/90"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Write a Review
                  </Button>
                </div>
              ) : (
                <PropertyReviews
                  reviews={reviews.map(review => ({
                    id: review.id.toString(),
                    user: {
                      name: review.user?.name || review.guest_name || 'Anonymous',
                      avatar: review.user?.avatar || '',
                      verified: !review.is_guest_review,
                    },
                    rating: review.rating,
                    date: review.created_at,
                    comment: {
                      en: review.comment,
                      fr: review.comment,
                    },
                    helpful: (review as any)?.helpful_count ?? 0,
                  }))}
                  language={language}
                  propertyRating={averageRating}
                  totalReviews={totalReviews}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-lg border-2 border-plp-purple/10">
            <CardHeader className="bg-gradient-to-r from-plp-purple/5 to-plp-purple/10">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    {getPriceContext(property).label ? "Pricing" : "Purchase Price"}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-plp-purple">
                      {property.price !== undefined && property.price !== null ? (
                        new Intl.NumberFormat('fr-CM', {
                          style: 'currency',
                          currency: 'XAF',
                          minimumFractionDigits: 0,
                        }).format(property.price || 0)
                      ) : (
                        <span>Price N/A</span>
                      )}
                    </div>
                    {getPriceContext(property).label && (
                      <span className="text-sm font-semibold text-gray-600 mb-1">
                        {getPriceContext(property).label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    {getPriceContext(property).description}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-6">
              {/* Platform Fee Notice */}
              {(publicSettings?.platform_fee_xaf || 0) > 0 && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm font-semibold text-purple-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Platform Access Fee
                  </p>
                  <p className="text-xs text-purple-800 mt-1">
                    {publicSettings?.customer_booking_free_mode === true ? (
                      "Free for a limited time! Secure this property now without any platform fees."
                    ) : (
                      <>
                        A platform fee of <span className="font-bold">{new Intl.NumberFormat('fr-CM', { style: 'currency', currency: publicSettings?.default_currency || 'XAF', minimumFractionDigits: 0 }).format(publicSettings?.platform_fee_xaf || 0)}</span> is required to secure this booking and access agent contact details.
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* Booking Section */}
              <div className="space-y-4">
                  {isForRent && (
                    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-blue-600" />
                        Booking Details
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="checkin" className="text-xs font-medium">Check-in</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal text-sm mt-1"
                              >
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {checkIn ? format(checkIn, 'MMM dd, yyyy') : 'Select'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={checkIn}
                                onSelect={setCheckIn}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label htmlFor="checkout" className="text-xs font-medium">Check-out</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal text-sm mt-1"
                              >
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {checkOut ? format(checkOut, 'MMM dd, yyyy') : 'Select'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={checkOut}
                                onSelect={setCheckOut}
                                disabled={(date) => date <= (checkIn || new Date())}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="guests" className="text-xs font-medium">Guests</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                            className="px-2"
                          >
                            −
                          </Button>
                          <span className="flex-1 text-center font-medium">{guests}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setGuests(guests + 1)}
                            className="px-2"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {isForRent && checkIn && checkOut && (
                    <div className="border-t pt-4 bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-gray-600">Nights:</span>
                        <span className="font-bold text-gray-900">{Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Amount</span>
                        <span className="font-bold text-lg text-plp-purple">{new Intl.NumberFormat('fr-CM', {
                          style: 'currency',
                          currency: 'XAF',
                          minimumFractionDigits: 0,
                        }).format(calculateTotal())}</span>
                      </div>
                    </div>
                  )}

                  {/* Special Requests */}
                  <div>
                    <Label htmlFor="special-requests" className="text-xs font-medium">Special Requests (optional)</Label>
                    <Textarea
                      id="special-requests"
                      placeholder="Any special requirements or preferences..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="mt-1 text-sm min-h-[80px]"
                    />
                  </div>

                  {/* Guest/User Booking Choice */}
                  {!isAuthenticated && !checkingAuth && (
                    <div className="space-y-3">
                      {bookingMode === 'choose' && (
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <h4 className="font-semibold text-gray-900 mb-3">How would you like to book?</h4>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left h-auto py-3"
                              onClick={() => setBookingMode('guest')}
                            >
                              <div>
                                <p className="font-medium">Continue as Guest</p>
                                <p className="text-xs text-gray-500">Book without creating an account</p>
                              </div>
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left h-auto py-3"
                              onClick={() => {
                                // Redirect to login page
                                window.location.href = `/${language}/auth/signin?redirect=${encodeURIComponent(window.location.pathname)}`;
                              }}
                            >
                              <div>
                                <p className="font-medium">Login / Register</p>
                                <p className="text-xs text-gray-500">Sign in to track your bookings</p>
                              </div>
                            </Button>
                          </div>
                        </div>
                      )}

                      {bookingMode === 'guest' && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">Your Details</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-blue-600 h-auto p-0"
                              onClick={() => setBookingMode('choose')}
                            >
                              Change
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <Label htmlFor="guest-name" className="text-xs font-medium">Full Name *</Label>
                              <Input
                                id="guest-name"
                                type="text"
                                placeholder="John Doe"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                className="mt-1 text-sm"
                              />
                            </div>
                            <div>
                              <Label htmlFor="guest-email" className="text-xs font-medium">Email Address *</Label>
                              <Input
                                id="guest-email"
                                type="email"
                                placeholder="john@example.com"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                className="mt-1 text-sm"
                              />
                            </div>
                            <div>
                              <Label htmlFor="guest-phone" className="text-xs font-medium">Phone Number *</Label>
                              <Input
                                id="guest-phone"
                                type="tel"
                                placeholder="+237 6XX XXX XXX"
                                value={guestPhone}
                                onChange={(e) => setGuestPhone(e.target.value)}
                                className="mt-1 text-sm"
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Confirmation will be sent to your email
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Authenticated user indicator */}
                  {isAuthenticated && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Booking as registered user
                      </p>
                    </div>
                  )}

                  {/* Booking Success Message */}
                  {bookingSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Booking submitted successfully!</span>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full bg-plp-purple hover:bg-plp-purple/90 h-11 font-semibold text-base"
                    onClick={handleBooking}
                    disabled={
                      isBooking || 
                      checkingAuth ||
                      (!isAuthenticated && bookingMode === 'choose')
                    }
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : checkingAuth ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : !isAuthenticated && bookingMode === 'choose' ? (
                      <>
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Select Booking Method
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {getPrimaryActionLabel()}
                      </>
                    )}
                  </Button>
              </div>

              {/* Purchase Details for Sale Properties */}
              {isForSale && (
                <div className="space-y-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    Purchase Details
                  </h4>
                  <p className="text-sm text-gray-700">Ready to invest in this property?</p>
                  
                  <div className="space-y-3 pt-2 border-t border-emerald-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Listed Price</span>
                      <span className="font-bold text-lg text-plp-purple">{new Intl.NumberFormat('fr-CM', {
                        style: 'currency',
                        currency: 'XAF',
                        minimumFractionDigits: 0,
                      }).format(property.price || 0)}</span>
                    </div>
                    
                    {property.is_negotiable && (
                      <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <span className="text-2xl mt-0.5">💰</span>
                        <div>
                          <p className="font-semibold text-sm text-amber-900">Price is Negotiable</p>
                          <p className="text-xs text-amber-800 mt-0.5">Contact the agent to discuss offers</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Both Rent and Sale */}
              {isBothRentAndSale && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
                  <p className="text-xs font-semibold text-purple-900 uppercase tracking-wide">Multi-Purpose Property</p>
                  <p className="text-sm text-purple-800 mt-1">Available for both rental and purchase</p>
                </div>
              )}
              
              <Button
                variant="outline"
                className="w-full h-10 font-semibold"
                onClick={hasUnlockedAgent || !isAuthenticated || currentUserType !== 'customer' ? handleContactAgent : handleUnlockAgent}
                disabled={unlockingAgent}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {unlockingAgent
                  ? 'Processing...'
                  : isAuthenticated && currentUserType === 'customer' && !hasUnlockedAgent && agentAccessStatus?.has_booking
                    ? `Pay ${new Intl.NumberFormat('fr-CM', { style: 'currency', currency: platformFeeCurrency || 'XAF', minimumFractionDigits: 0 }).format(platformFeeXaf || 0)} & Contact Agent`
                    : 'Contact Agent'}
              </Button>
              
              {agent && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                  <p className="text-xs text-gray-600 font-medium mb-2">Questions? Reach out to</p>
                  <p className="font-semibold text-gray-900">{agent.user?.name}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Similar Properties */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {similarProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </>
  );
}
