import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeService } from './stripe.service';
import {
	Registration,
	RegistrationSchemaFactory,
} from '../course-registration/entities/registration.entity';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Registration.name,
				useFactory: RegistrationSchemaFactory,
			},
		]),
	],
	controllers: [PaymentsController],
	providers: [PaymentsService, StripeService],
	exports: [PaymentsService],
})
export class PaymentsModule {}
