import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StripeService } from './stripe.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { Registration } from '../course-registration/entities/registration.entity';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
	private readonly logger = new Logger(PaymentsService.name);

	constructor(
		private readonly stripeService: StripeService,
		@InjectModel(Registration.name)
		private registrationModel: Model<Registration>,
	) {}

	async createCheckoutSession(dto: CreateCheckoutSessionDto) {
		try {
			const stripe = this.stripeService.getInstance();

			const session = await stripe.checkout.sessions.create({
				payment_method_types: ['card'],
				mode: 'payment',
				line_items: [
					{
						price_data: {
							currency: 'vnd',
							product_data: {
								name: dto.courseName,
								description: `Đăng ký khóa học: ${dto.courseName}`,
							},
							unit_amount: dto.amount,
						},
						quantity: 1,
					},
				],
				metadata: {
					registrationId: dto.registrationId,
					studentId: dto.studentId,
				},
				success_url: dto.successUrl,
				cancel_url: dto.cancelUrl,
			});

			return { url: session.url };
		} catch (error) {
			this.logger.error(`Error creating checkout session: ${error.message}`);
			throw error;
		}
	}

	async handleStripeWebhook(body: any, sig: string): Promise<void> {
		try {
			const event = await this.stripeService.constructWebhookEvent(body, sig);

			if (event.type === 'checkout.session.completed') {
				const session = event.data.object as Stripe.Checkout.Session;
				const registrationId = session.metadata.registrationId;

				await this.registrationModel.findByIdAndUpdate(
					registrationId,
					{
						status: 'PAID',
						payment: {
							method: 'stripe',
							sessionId: session.id,
							amount: session.amount_total,
							currency: session.currency,
							status: session.payment_status,
							createdAt: new Date(),
						},
					},
					{ new: true },
				);

				this.logger.log(
					`Payment completed for registration: ${registrationId}`,
				);
			}
		} catch (error) {
			this.logger.error(`Webhook error: ${error.message}`);
			throw error;
		}
	}
}
