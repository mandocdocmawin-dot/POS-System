import {z} from 'zod';
export const customerFormSchema=z.object({name:z.string().trim().min(1,'Name is required.').max(120),phone:z.string().trim().refine(v=>!v||/^(09\d{9}|\+639\d{9}|639\d{9})$/.test(v.replace(/[\s()-]/g,'')),'Enter a PH mobile number: 09xxxxxxxxx or +639xxxxxxxxx.'),email:z.union([z.email(),z.literal('')]),address:z.string(),notes:z.string(),status:z.enum(['active','inactive']),openingWallet:z.number().finite().nonnegative()});
export type CustomerFormValues=z.infer<typeof customerFormSchema>;
