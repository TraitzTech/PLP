'use client'

import React, { useEffect, useState } from 'react';
import { useTranslations } from '@/components/translation-provider';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown, Building2, Phone, CreditCard, Smartphone, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { subscriptionService, type SubscriptionPlan, type AgentSubscription } from '@/services/subscriptionService';
import { authService } from '@/services/authService';

const planIcons: Record<string, React.ElementType> = {
	free: Building2,
	starter: Building2,
	professional: Star,
	enterprise: Crown,
};

const planColors: Record<string, string> = {
	free: 'bg-green-600',
	starter: 'bg-plp-purple',
	professional: 'bg-plp-pink',
	enterprise: 'bg-plp-yellow',
};

const paymentMethodIcons = [Smartphone, Building2, CreditCard];
const paymentMethodPopular = [true, false, false];

export default function PricingPage() {
	const t = useTranslations();
	const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
	const [loading, setLoading] = useState(true);
	const [isAgent, setIsAgent] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [currentSubscription, setCurrentSubscription] = useState<AgentSubscription | null>(null);

	useEffect(() => {
		const bootstrap = async () => {
			setLoading(true);
			try {
				const [authed, user] = await Promise.all([
					authService.isAuthenticated(),
					authService.getCurrentUser(),
				]);

				const audience = ((user as any)?.user_type === 'agent' ? 'agent' : undefined) as 'agent' | undefined;
				const plansRes = await subscriptionService.getPublicPlans(audience ? { audience } : undefined);

				setPlans(plansRes.data || []);
				setIsAuthenticated(authed);
				const agent = (user as any)?.user_type === 'agent';
				setIsAgent(agent);

				if (authed && agent) {
					try {
						const subRes = await subscriptionService.getCurrentAgentSubscription();
						setCurrentSubscription(subRes.data?.subscription || null);
					} catch {
						// agent may not have subscription yet
					}
				}
			} catch {
				// silently fail — plans will be empty
			} finally {
				setLoading(false);
			}
		};

		bootstrap();
	}, []);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('fr-CM', {
			style: 'currency',
			currency: 'XAF',
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const isCurrentPlan = (plan: SubscriptionPlan) => {
		if (!currentSubscription) return false;
		return currentSubscription.subscription_plan_id === plan.id &&
			['active', 'trialing'].includes(currentSubscription.status);
	};

	const mostPopularPlan = plans.length > 1
		? plans.reduce((best, p) => (p.price > 0 && (!best || p.sort_order === 2) ? p : best), null as SubscriptionPlan | null)
		: null;

	return (
		<div className="min-h-screen bg-white">
			<Navbar />

			<div className="pt-20">
				{/* Hero Section */}
				<section className="py-20 bg-gradient-to-r from-plp-purple via-plp-pink to-plp-yellow">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
						<div className="space-y-6">
							<h1 className="text-4xl sm:text-6xl font-bold text-white">
								{t('pricing.heroTitle')}
								<span className="block text-plp-yellow">{t('pricing.heroTitleAccent')}</span>
							</h1>
							<p className="text-xl text-white/90 max-w-3xl mx-auto">
								{t('pricing.heroSubtitle')}
							</p>
							<div className="flex flex-col sm:flex-row justify-center items-center gap-8 pt-8">
								<div className="text-center">
									<div className="text-3xl font-bold text-white">{plans.length}</div>
									<div className="text-white/80">{t('pricing.availablePlans')}</div>
								</div>
								<div className="hidden sm:block w-px h-12 bg-white/30"></div>
								<div className="text-center">
									<div className="text-3xl font-bold text-white">24/7</div>
									<div className="text-white/80">{t('pricing.customerSupport')}</div>
								</div>
								<div className="hidden sm:block w-px h-12 bg-white/30"></div>
								<div className="text-center">
									<div className="text-3xl font-bold text-white">0 XAF</div>
									<div className="text-white/80">{t('pricing.toGetStarted')}</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Current Plan Banner (if agent is logged in) */}
				{isAuthenticated && isAgent && currentSubscription && (
					<section className="bg-green-50 border-b border-green-200">
						<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
							<div className="flex flex-col sm:flex-row items-center justify-between gap-3">
								<div className="flex items-center gap-3">
									<Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">{t('pricing.currentPlanBadge')}</Badge>
									<span className="font-semibold text-green-900">
										{currentSubscription.plan?.name || 'Free'}
									</span>
									<span className="text-green-700 text-sm">
										— {currentSubscription.status === 'trialing' ? t('pricing.trialPeriod') : t('pricing.active')}
									</span>
								</div>
								<Link href="/dashboard/agent/subscription">
									<Button variant="outline" size="sm" className="border-green-600 text-green-700 hover:bg-green-100">
										{t('pricing.manageSubscription')}
									</Button>
								</Link>
							</div>
						</div>
					</section>
				)}

				{/* Pricing Plans */}
				<section className="py-20 bg-gray-50">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<h2 className="text-3xl font-bold text-gray-900 mb-4">
								{t('pricing.choosePlan')}
							</h2>
							<p className="text-lg text-gray-600 max-w-2xl mx-auto">
								{t('pricing.choosePlanSub')}
							</p>
						</div>

						{loading ? (
							<div className="flex justify-center items-center py-20">
								<Loader2 className="w-8 h-8 animate-spin text-plp-purple" />
								<span className="ml-3 text-gray-500">{t('pricing.loadingPlans')}</span>
							</div>
						) : plans.length === 0 ? (
							<div className="text-center py-20 text-gray-500">
								<p className="text-lg">{t('pricing.noPlans')}</p>
								<p className="text-sm mt-2">{t('pricing.tryAgain')}</p>
							</div>
						) : (
							<div className={`grid grid-cols-1 ${plans.length === 1 ? 'max-w-md' : plans.length === 2 ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-3 max-w-6xl'} gap-8 mx-auto`}>
								{plans.map((plan) => {
									const Icon = planIcons[plan.slug] || Building2;
									const bgColor = planColors[plan.slug] || 'bg-plp-purple';
									const isPopular = mostPopularPlan?.id === plan.id && plans.length > 1;
									const isCurrent = isCurrentPlan(plan);

									return (
										<Card
											key={plan.id}
											className={`relative overflow-hidden ${
												isCurrent
													? 'border-2 border-green-500 shadow-2xl ring-2 ring-green-200'
													: isPopular
														? 'border-2 border-plp-pink shadow-2xl scale-105'
														: 'border border-gray-200 shadow-lg'
											}`}
										>
											{isCurrent && (
												<div className="absolute top-0 left-0 right-0 bg-green-600 text-white text-center py-2 text-sm font-medium">
													{t('pricing.yourCurrentPlan')}
												</div>
											)}
											{!isCurrent && isPopular && (
												<div className="absolute top-0 left-0 right-0 bg-plp-pink text-white text-center py-2 text-sm font-medium">
													{t('pricing.mostPopular')}
												</div>
											)}

											<CardHeader className={`text-center ${isCurrent || isPopular ? 'pt-12' : 'pt-8'}`}>
												<div className={`mx-auto w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center mb-4`}>
													<Icon className="w-8 h-8 text-white" />
												</div>
												<CardTitle className="text-2xl font-bold text-gray-900">
													{plan.name}
												</CardTitle>
												{plan.plan_category && (
													<Badge className="mx-auto bg-blue-100 text-blue-700 capitalize mt-2">
														{plan.plan_category}
													</Badge>
												)}
												<p className="text-gray-600">{plan.description}</p>
												<div className="pt-4">
													<div className="text-4xl font-bold text-gray-900">
														{plan.price === 0 ? (
															<span className="text-green-600">{t('pricing.free')}</span>
														) : (
															<>
																{formatCurrency(plan.price)}
																<span className="text-lg text-gray-600 font-normal">/{plan.billing_period === 'monthly' ? t('pricing.month') : plan.billing_period === 'quarterly' ? t('pricing.quarter') : t('pricing.year')}</span>
															</>
														)}
													</div>
													{plan.free_trial_days > 0 && (
														<p className="text-sm text-plp-pink mt-1">{plan.free_trial_days} {t('pricing.freeTrial')}</p>
													)}
												</div>
											</CardHeader>

											<CardContent className="space-y-6">
												<div className="space-y-3">
													{(plan.benefits || []).map((benefit, index) => (
														<div key={index} className="flex items-start gap-3">
															<Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
															<span className="text-gray-700">{benefit}</span>
														</div>
													))}
													{plan.property_limit !== null && (
														<div className="flex items-start gap-3">
															<Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
															<span className="text-gray-700">
{plan.property_limit === 0 ? t('pricing.noListings') : `${t('pricing.upToListings')} ${plan.property_limit} ${t('pricing.listings')}`}
														</span>
													</div>
												)}
												{plan.property_limit === null && (
													<div className="flex items-start gap-3">
														<Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
														<span className="text-gray-700">{t('pricing.unlimitedListings')}</span>
													</div>
												)}
												<div className="flex items-start gap-3">
													<Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
													<span className="text-gray-700 capitalize">{t('pricing.audience')}: {plan.target_audience || 'both'}</span>
													</div>
												</div>

												{isCurrent ? (
													<Link href="/dashboard/agent/subscription">
														<Button className="w-full bg-green-600 hover:bg-green-700 text-white">
															{t('pricing.currentPlanManage')}
														</Button>
													</Link>
												) : (
													<Link href={`/payment/subscribe?plan=${plan.slug}`}>
														<Button
															className={`w-full ${
																isPopular ? 'btn-secondary' : 'btn-primary'
															}`}
														>
															{plan.price === 0 ? t('pricing.startFree') : t('pricing.chooseThisPlan')}
														</Button>
													</Link>
												)}

												<p className="text-xs text-gray-500 text-center">
													{t('pricing.cancelAnytime')}
												</p>
											</CardContent>
										</Card>
									);
								})}
							</div>
						)}
					</div>
				</section>

				{/* Payment Methods */}
				<section className="py-20 bg-white">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<h2 className="text-3xl font-bold text-gray-900 mb-4">
								{t('pricing.paymentMethods')}
							</h2>
							<p className="text-lg text-gray-600">
								{t('pricing.paymentMethodsSub')}
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
							{[0, 1, 2].map((i) => {
								const Icon = paymentMethodIcons[i];
								const isPopular = paymentMethodPopular[i];
								return (
									<Card key={i} className="text-center">
										<CardContent className="p-8">
											<div className={`mx-auto w-16 h-16 ${
												isPopular ? 'bg-plp-pink' : 'bg-gray-100'
											} rounded-2xl flex items-center justify-center mb-4`}>
												<Icon className={`w-8 h-8 ${
													isPopular ? 'text-white' : 'text-gray-600'
												}`} />
											</div>
											<h3 className="text-xl font-semibold text-gray-900 mb-2">
												{t(`pricing.paymentMethodItems.${i}.name`)}
											</h3>
											<p className="text-gray-600">{t(`pricing.paymentMethodItems.${i}.description`)}</p>
											{isPopular && (
												<Badge className="mt-3 bg-plp-pink/10 text-plp-pink">
													{t('pricing.mostPopularBadge')}
												</Badge>
											)}
										</CardContent>
									</Card>
								);
							})}
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section className="py-20 bg-gray-50">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<h2 className="text-3xl font-bold text-gray-900 mb-4">
								{t('pricing.faqTitle')}
							</h2>
						</div>

						<div className="max-w-3xl mx-auto space-y-6">
							{[0, 1, 2, 3].map((i) => (
								<Card key={i}>
									<CardContent className="p-6">
										<h3 className="text-lg font-semibold text-gray-900 mb-2">
											{t(`pricing.faqs.${i}.question`)}
										</h3>
										<p className="text-gray-600">{t(`pricing.faqs.${i}.answer`)}</p>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20 bg-plp-purple">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
						<div className="space-y-6">
							<h2 className="text-3xl font-bold text-white">
								{t('pricing.ctaTitle')}
							</h2>
							<p className="text-xl text-white/90 max-w-2xl mx-auto">
								{t('pricing.ctaSub')}
							</p>
							<div className="flex flex-col sm:flex-row justify-center gap-4">
								<Link href="/auth/signup?type=agent">
									<Button className="btn-accent">
										{t('pricing.becomeAgent')}
									</Button>
								</Link>
								<Link href="/contact">
									<Button variant="outline" className="border-white text-white hover:bg-white text-plp-purple">
										<Phone className="w-4 h-4 mr-2" />
										{t('pricing.contactUs')}
									</Button>
								</Link>
							</div>
						</div>
					</div>
				</section>
			</div>

			<Footer />
		</div>
	);
}
