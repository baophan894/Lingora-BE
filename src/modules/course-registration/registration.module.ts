import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
	Registration,
	RegistrationSchemaFactory,
} from './entities/registration.entity';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Registration.name,
				useFactory: RegistrationSchemaFactory,
			},
		]),
		PaymentsModule,
	],
	controllers: [RegistrationController],
	providers: [RegistrationService],
})
export class RegistrationModule {}
