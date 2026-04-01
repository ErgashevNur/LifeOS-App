import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsString,
  Max,
  Min,
  MinLength,
} from "class-validator";

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  firstName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  lastName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "+998901234567" })
  @IsString()
  @MinLength(9)
  phone!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  address!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  region!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  city!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  district!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  profession!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @MinLength(16)
  refreshToken!: string;
}

export class AddTaskDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;
}

export class CreateGoalDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiProperty({ enum: ["Yillik", "Oylik", "Haftalik", "Kunlik"] })
  @IsString()
  @IsIn(["Yillik", "Oylik", "Haftalik", "Kunlik"])
  period!: "Yillik" | "Oylik" | "Haftalik" | "Kunlik";

  @ApiProperty()
  @IsNumber()
  @Min(1)
  targetValue!: number;

  @ApiProperty()
  @IsString()
  deadline!: string;
}

export class UpdateGoalProgressDto {
  @ApiProperty()
  @IsInt()
  delta!: number;
}

export class CreateHabitDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  title!: string;
}

export class CreateBookDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  author!: string;

  @ApiProperty()
  @IsString()
  category!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  pages!: number;
}

export class UpdateBookPagesDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  readPages!: number;
}

export class AddCommentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  text!: string;
}

export class AmountDto {
  @ApiProperty()
  @IsNumber()
  amount!: number;
}

export class SleepDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(24)
  hours!: number;
}

export class AddSkillDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  hours!: number;
}

export class AddFocusSessionDto {
  @ApiProperty()
  @IsString()
  skillId!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  minutes!: number;
}

export class ToggleConnectionDto {
  @ApiProperty()
  @IsInt()
  userId!: number;
}

export class SendNetworkMessageDto {
  @ApiProperty()
  @IsInt()
  userId!: number;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  message!: string;
}

export class AssistantPromptDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  prompt!: string;
}

export class UpdateLanguageDto {
  @ApiProperty()
  @IsString()
  language!: string;
}

export class ToggleByKeyDto {
  @ApiProperty()
  @IsString()
  key!: string;
}
