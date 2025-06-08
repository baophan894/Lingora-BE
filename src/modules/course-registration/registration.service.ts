import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Registration } from './entities/registration.entity';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class RegistrationService {
	private readonly logger = new Logger(RegistrationService.name);

	constructor(
		@InjectModel(Registration.name) public model: Model<Registration>,
		private readonly paymentsService: PaymentsService,
	) {}

	async createRegistration(studentId: string, classId: string) {
		try {
			console.log(studentId, classId);
			const registration = new this.model({
				studentId,
				classId,
				status: 'PENDING',
				createdAt: new Date(),
			});
			return await registration.save();
		} catch (error) {
			this.logger.error(`Error creating registration: ${error.message}`);
			throw error;
		}
	}

	async createPaymentSession(
		registrationId: string,
		amount: number,
		studentEmail: string,
		courseName: string,
	) {
		try {
			const registration = await this.model.findById(registrationId);
			if (!registration) {
				throw new Error('Registration not found');
			}

			const frontendUrl = process.env.FRONTEND_URL;
			return await this.paymentsService.createCheckoutSession({
				registrationId,
				studentId: registration.studentId.toString(),
				amount,
				courseName,
				successUrl: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
				cancelUrl: `${frontendUrl}/payment-cancel`,
			});
		} catch (error) {
			this.logger.error(`Error creating payment session: ${error.message}`);
			throw error;
		}
	}

	async getStudentRegistrations(studentId: string) {
		try {
			return await this.model.find({ studentId }).sort({ createdAt: -1 });
		} catch (error) {
			this.logger.error(
				`Error getting student registrations: ${error.message}`,
			);
			throw error;
		}
	}
}
