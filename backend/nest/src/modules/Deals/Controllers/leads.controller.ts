import { TokenGuard } from '@Core/Guard/token-guard.decorator';
import type { CreateLeadDto, UpdateLeadDto } from '@Deals/Interfaces/deals.interface';
import { LeadsService } from '@Deals/Services/leads.service';
import { Controller, Get, Param, Post, Query, Body, Patch, Delete } from '@nestjs/common';

@Controller('leads')
export class LeadsController {
    constructor (private leadsService: LeadsService) {}

    @Get('/:status')
    @TokenGuard()
    getLeads(
        @Param('status') status: number,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
        @Query('agent') agent?: string,
        @Query('sort') sort?: string,
        @Query('order') order?: string,
    ) {
        return this.leadsService.getLeads(status, {limit, offset, agent, sort, order});
    }

    @Get('/leads/:id')
    @TokenGuard()
    getLeadById(@Param('id') id: number) {
        return this.leadsService.getLeadById(id);
    }

    @Post('/')
    @TokenGuard()
    createLead(
        @Body() {
            name,
            email,
            phone,
            source,
            budget,
            project
        }: CreateLeadDto,
    ) {
        return this.leadsService.createLead({ name, email, phone, source, budget, project });
    }

    @Patch('/:id')
    @TokenGuard()
    updateLead(
        @Param('id') id: number,
        @Body() updateLeadDto: UpdateLeadDto,
    ) {
        return this.leadsService.updateLead(id, updateLeadDto);
    }
    
    @Delete('/:id')
    @TokenGuard(['super_admin'])
    deleteLead(@Param('id') id: number) {
        return this.leadsService.deleteLead(id);
    }
}