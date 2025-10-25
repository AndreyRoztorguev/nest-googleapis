import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DateTimeDto {
  @IsDateString()
  dateTime: string;

  @IsOptional()
  @IsString()
  timeZone?: string;
}

export class CreateEventDto {
  @IsString()
  summary: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @ValidateNested()
  @Type(() => DateTimeDto)
  start: DateTimeDto;

  @ValidateNested()
  @Type(() => DateTimeDto)
  end: DateTimeDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attendees?: string[];
}
