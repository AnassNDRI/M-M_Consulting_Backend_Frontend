import { Controller, Get } from '@nestjs/common';
import { ContracttypeService } from './contracttype.service';

@Controller('api/contracttype')
export class ContracttypeController {

  constructor(
    private readonly contracttypeService: ContracttypeService,
  ) {}

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Contract Types @@@@@@@@@@@@@@@@
  @Get('contractTypes')
  async getAllContractTypes() {
    return this.contracttypeService.getAllContractTypes();
  }
}
