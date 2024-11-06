import { createTransport } from 'nodemailer';
import { render } from '@react-email/render';
import { WelcomeEmail } from '@/emails/welcome';
import { RenewalEmail } from '@/emails/renewal';
import { CancellationEmail } from '@/emails/cancellation';

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT!),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const templates = {
  welcome: WelcomeEmail,
  renewal: RenewalEmail,
  cancellation: CancellationEmail,
};

interface SendEmailOptions {
  to: string;
  subject: string;
  template: keyof typeof templates;
  data: Record<string, any>;
}

export async function sendEmail({ to, subject, template, data }: SendEmailOptions) {
  const Template = templates[template];
  const html = render(<Template {...data} />);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}