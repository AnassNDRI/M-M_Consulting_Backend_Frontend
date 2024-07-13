import { ApiResponse } from "../../../../shared/model";
import { CvDtoInterface } from "./indexResponse";

export interface ApiResponseWithCv extends ApiResponse {
  data: CvDtoInterface | CvDtoInterface[] | null;  
}
