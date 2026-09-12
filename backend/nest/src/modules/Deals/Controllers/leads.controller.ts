import { TokenGuard } from '@Core/Guard/token-guard.decorator';
import type { CreateLeadDto, UpdateLeadDto } from '@Deals/Interfaces/deals.interface';
import { LeadsService } from '@Deals/Services/leads.service';
import { DashboardService } from '@Dashboard/Services/dashboard.service';
import { Controller, Get, Param, Post, Query, Body, Patch, Delete } from '@nestjs/common';

@Controller('leads')
export class LeadsController {
    constructor (
        private leadsService: LeadsService,
        private dashboardService: DashboardService,
    ) {}

    @Get('/:status')
    @TokenGuard()
    getLeads(
        @Param('status') status: number,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
        @Query('agent') agent?: string,
        @Query('sort') sort?: string,
        @Query('order') order?: string,
        @Query('source') source?: string,
        @Query('project') project?: string,
    ) {
        return this.leadsService.getLeads(status, {limit, offset, agent, sort, order, source, project});
    }

    @Get('/:id')
    @TokenGuard()
    getLeadById(@Param('id') id: number) {
        return this.leadsService.getLeadById(id);
    }

    @Post('/filters')
    @TokenGuard()
    getLeadFilters() {
        return this.leadsService.getLeadFilters();
    }

    @Post('/')
    @TokenGuard()
    async createLead(
        @Body() {
            name,
            email,
            phone,
            source,
            budget,
            project
        }: CreateLeadDto,
    ) {
        await this.dashboardService.unableDashboard();
        return this.leadsService.createLead({ name, email, phone, source, budget, project });
    }

    @Patch('/:id')
    @TokenGuard()
    async updateLead(
        @Param('id') id: number,
        @Body() updateLeadDto: UpdateLeadDto,
    ) {
        await this.dashboardService.unableDashboard();
        return this.leadsService.updateLead(id, updateLeadDto);
    }
    
    @Delete('/:id')
    @TokenGuard(['super_admin'])
    async deleteLead(@Param('id') id: number) {
        await this.dashboardService.unableDashboard();
        return this.leadsService.deleteLead(id);
    }
}