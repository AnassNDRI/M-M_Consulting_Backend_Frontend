import { Controller, Get } from '@nestjs/common';
import { RoleService } from './role.service';

@Controller('api/roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  All Job Titles @@@@@@@@@@@@@@@@
  @Get('roles')
  async getEmployeeRoles() {
    return this.roleService.getEmployeeRoles();
  }
}
