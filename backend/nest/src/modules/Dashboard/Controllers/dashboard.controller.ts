import { DashboardService } from '@Dashboard/Services/dashboard.service';
import { Controller, Get } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {
    constructor (private dashboardService: DashboardService) {}

    @Get('/summary')
    getSummary() {
        return this.dashboardService.getSummary();
    }
}