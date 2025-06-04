import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailVerification(email: string, token: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác thực tài khoản Lingora',
      template: 'verify-email.hbs',
      context: {
        link: `http://localhost:5173/verify-email?token=${token}`,
      },
    });
  }

  async sendResetPassword(email: string, token: string) {

    console.log('Sending reset password email to:', email);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Đặt lại mật khẩu Lingora',
      template: 'reset-password.hbs',
      context: {
        link: `http://localhost:5173/reset-password?token=${token}`,
      },
    });
  }
}
