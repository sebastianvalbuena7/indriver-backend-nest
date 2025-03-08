import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class ParseAndValidateUserPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
        const userJson = JSON.parse(value.user);

        const updateUserDto = plainToInstance(UpdateUserDto, userJson);

        const errors = await validate(updateUserDto);
        if (errors.length > 0) {
            const formattedErrors = errors
                .map(err => Object.values(err.constraints))
                .flat();

            throw new BadRequestException(formattedErrors);
        }

        return updateUserDto;
    }
}
