import 'dotenv/config'
export const env = {
    MONGO_URI: process.env.MONGO_URI,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    PORT: process.env.PORT,
}
