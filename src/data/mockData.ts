export interface Company {
  id: string;
  name: string;
  city: string;
  address: string;
  postalCode: string;
  lat: number;
  lng: number;
  thematic: string;
  description: string;
  logo: string;
  banner: string;
  photos: string[];
  whatYouWillDiscover: string[];
  jobs: string[];
  video?: string;
  accessibility: {
    pmr: boolean;
    parking: boolean;
  };
  safety: string[];
  equipmentProvided: string[];
  equipmentToBring: string[];
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  visits: Visit[];
}

export interface Visit {
  id: string;
  date: string;
  time: string;
  duration: number;
  capacity: number;
  registered: number;
  type: string;
}

export interface Thematic {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  school: string;
  photo: string;
  quote: string;
}

export interface Stat {
  number: string;
  label: string;
  icon: string;
}

export const thematics: Thematic[] = [];
export const companies: Company[] = [];
export const testimonials: Testimonial[] = [];
export const stats: Stat[] = [];
