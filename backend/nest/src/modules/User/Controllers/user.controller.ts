import { TokenGuard } from '@Core/Guard/token-guard.decorator';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from '@User/Services/user.service';

@Controller('user')
export class UserController {
    constructor (private userService: UserService) {}

    @Get('profile/:id')
    @TokenGuard(['admin', 'super_admin'])
    profile(@Param('id') id: number) {
        return this.userService.getUser(id);
    }

    @Post('register')
    @TokenGuard(['admin', 'super_admin'])
    register(@Body() body: any) {
        return this.userService.register(body);
    }

    @Post('find')
    @TokenGuard(['admin', 'super_admin'])
    findOrCreate(@Body() body: any) {
        return this.userService.findOrCreate(body);
    }

    @Post('register-many')
    @TokenGuard(['admin', 'super_admin'])
    registerMany(@Body() body: any) {
        return this.userService.registerMany(body);
    }

}