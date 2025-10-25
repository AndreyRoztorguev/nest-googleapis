import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DateTimeDto {
  @ApiProperty({
    description: 'Event date and time in ISO 8601 format',
    example: '2025-10-26T10:00:00Z',
  })
  @IsDateString()
  dateTime: string;

  @ApiProperty({
    description: 'Timezone identifier',
    example: 'America/New_York',
    required: false,
  })
  @IsOptional()
  @IsString()
  timeZone?: string;
}

export class CreateEventDto {
  @ApiProperty({
    description: 'Event title/summary',
    example: 'Team Meeting',
  })
  @IsString()
  summary: string;

  @ApiProperty({
    description: 'Event description',
    example: 'Weekly team sync meeting',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Event location',
    example: 'Conference Room A',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Event start time',
    type: DateTimeDto,
  })
  @ValidateNested()
  @Type(() => DateTimeDto)
  start: DateTimeDto;

  @ApiProperty({
    description: 'Event end time',
    type: DateTimeDto,
  })
  @ValidateNested()
  @Type(() => DateTimeDto)
  end: DateTimeDto;

  @ApiProperty({
    description: 'List of attendee email addresses',
    example: ['john@company.com', 'jane@company.com'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attendees?: string[];
}
