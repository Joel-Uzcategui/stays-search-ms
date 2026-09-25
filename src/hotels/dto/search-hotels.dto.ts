import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsISO31661Alpha2,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

const RADII = [1, 5, 10] as const;

export class SearchHotelsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @IsISO31661Alpha2()
  @Transform(({ value }: { value: string }) => value?.toUpperCase())
  country?: string;

  @IsOptional()
  @IsUUID('4')
  cityId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  guests?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @Transform(({ value }: { value: string | string[] }) =>
    Array.isArray(value) ? value : value?.split(',').filter(Boolean),
  )
  amenities?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  lon?: number;

  @ValidateIf((dto: SearchHotelsDto) => dto.lat !== undefined)
  @Type(() => Number)
  @IsInt()
  @Transform(({ value }: { value: number }) =>
    RADII.includes(value as (typeof RADII)[number]) ? value : 5,
  )
  radiusKm?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
