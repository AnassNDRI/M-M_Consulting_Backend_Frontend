import { ApiResponse } from "../../../../shared/model";

export interface ApiResponseWithCount extends ApiResponse {
  count?: number; 
}