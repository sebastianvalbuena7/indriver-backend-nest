import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
    constructor(
        private userService: UsersService
    ) { }

    @Post()
    create(@Body() user: CreateUserDto) {
        return this.userService.create(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    allUsers() {
        return this.userService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() user: UpdateUserDto) {
        return this.userService.update(id, user);
    }

    @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
                new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })
            ]
        })
    ) file: Express.Multer.File) {
        return this.userService.updateWithImage(file);
    }

}
