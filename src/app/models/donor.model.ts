import { Gift } from './gift.model';

export interface Donor {
  id?: number;
  name: string;
  email: string;
  address: string;
  gifts?: Gift[];
}
