export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: "Strength" | "Cardio" | "Accessories" | "Flooring";
  rating: number;
  specifications: string[];
  imageUrl: string;
  customizationOptions: {
    materials: string[];
    colors: string[];
    weightSteps?: number[];
  };
}

export interface GymItem3D {
  id: string;
  productId: string;
  name: string;
  x: number; // grid position x (0 to 12)
  y: number; // grid position y (0 to 12)
  rotation: number; // rotation in degrees (0, 90, 180, 270)
  color: string; // custom hex color
  material: string; // custom steel, chrome, gold, matte finish
}

export interface CartItem {
  product: Product;
  quantity: number;
  customMaterial?: string;
  customColor?: string;
  customWeight?: number;
}

export interface AdvisorResponse {
  title: string;
  recommendedProducts: Array<{
    name: string;
    price: number;
    reason: string;
  }>;
  totalEstimatedPrice: number;
  layoutStrategy: string;
  professionalAdvice: string;
  motivationalQuote: string;
}
