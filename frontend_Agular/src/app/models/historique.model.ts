export interface Historiques {
  historiqueId: number;
  histNumber: number;
  publicationDate?: Date;
  jobCloseDate: Date;
  nameCompany?: string;
  nameRecruiter?: string;
  firstnameRecruiter?: string;
  jobtitle: string;
  contractTypetitle: string;
  JobLocation: string;
  numberOfCandidates: number;
  savedInAccounting: boolean; // pour la vérification de son enregistrement par le service compta
  checkUserConsultant?: string;
  tvaNumber?: string;
  addressCompany?: string;
  email?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}
