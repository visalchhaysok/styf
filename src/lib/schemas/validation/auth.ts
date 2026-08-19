import { email, z } from 'zod'

export const LoginSchema = z.object({
    email: z.email({
        error: (issue) => {
            if (issue.input === undefined) {
                return 'Email field is missing'
            }
            return 'Please enter a valid email address (eq. yourEmail@email.com)'
        }
    })
    ,
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(72, 'Password must not exceed 72 characters')
})

export const SignUpSchema = LoginSchema.extend({
    username: z
        .string()
        .max(72, 'Username must not exceed 72 characters')
})