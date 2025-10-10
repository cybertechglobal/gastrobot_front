export interface AddonGroup {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  description: string;
  minSelection: number;
  maxSelection: number;
  addonOptions: AddonOptions;
}

export interface AddonOptions {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  description: string;
  price: string;
  isAvailable: boolean;
}
