import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService implements OnModuleInit {
	private stripe: Stripe;

	constructor(private configService: ConfigService) {}

	onModuleInit() {
		const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
		if (!stripeSecretKey) {
			throw new Error('STRIPE_SECRET_KEY is not defined');
		}
		this.stripe = new Stripe(stripeSecretKey, {
			apiVersion: '2025-05-28.basil',
		});
	}

	getInstance(): Stripe {
		if (!this.stripe) {
			throw new Error('Stripe instance not initialized');
		}
		return this.stripe;
	}

	async constructWebhookEvent(
		payload: any,
		signature: string,
	): Promise<Stripe.Event> {
		const webhookSecret = this.configService.get<string>(
			'STRIPE_WEBHOOK_SECRET',
		);
		if (!webhookSecret) {
			throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
		}

		try {
			return this.stripe.webhooks.constructEvent(
				payload,
				signature,
				webhookSecret,
			);
		} catch (err) {
			throw new Error(`Webhook Error: ${err.message}`);
		}
	}
}
