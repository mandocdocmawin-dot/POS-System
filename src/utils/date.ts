import { settingsService } from '../services/settingsService';
import {formatDate as date, formatTime as time} from './formatters';
export const formatDate = (value:string|Date) => date(value, settingsService.get().general.dateFormat);
export const formatTime = (value:string|Date) => time(value, settingsService.get().general.timeFormat);

export const localDate = (value = new Date()) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

export const formatDateTime=(value:string|Date)=>`${formatDate(value)} ${formatTime(value)}`;
