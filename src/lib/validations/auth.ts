import { z } from 'zod';

export const SignupSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, { message: 'الاسم الأول يجب أن يحتوي على حرفين على الأقل' })
    .max(50, { message: 'الاسم الأول طويل جداً' }),
  lastName: z
    .string()
    .trim()
    .min(2, { message: 'الاسم الأخير يجب أن يحتوي على حرفين على الأقل' })
    .max(50, { message: 'الاسم الأخير طويل جداً' }),
  email: z
    .string()
    .trim()
    .email({ message: 'يرجى إدخال بريد إلكتروني صالح' })
    .toLowerCase(),
  password: z
    .string()
    .min(8, { message: 'كلمة المرور يجب ألا تقل عن 8 أحرف' })
    .regex(/[A-Za-z]/, { message: 'كلمة المرور يجب أن تحتوي على حرف واحد على الأقل' })
    .regex(/[0-9]/, { message: 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل' }),
});

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'يرجى إدخال بريد إلكتروني صالح' })
    .toLowerCase(),
  password: z
    .string()
    .min(1, { message: 'كلمة المرور مطلوبة' }),
});

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'يرجى إدخال بريد إلكتروني صالح' })
    .toLowerCase(),
});

export const ResetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'يرجى إدخال بريد إلكتروني صالح' })
    .toLowerCase(),
  otpCode: z
    .string()
    .trim()
    .length(6, { message: 'رمز التحقق يجب أن يتكون من 6 أرقام' }),
  newPassword: z
    .string()
    .min(8, { message: 'كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف' }),
});
