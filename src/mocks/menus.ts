export interface MenuItemResponse {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuListResponse {
  items: MenuItemResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const mockMenus: MenuItemResponse[] = [
  {
    id: 'menu_1',
    storeId: 'store_1',
    name: '햄 & 치즈 샌드위치',
    description: '신선한 햄과 치즈가 듬뿍 들어간 샌드위치',
    category: '샌드위치',
    price: 6800,
    image: '/images/mock/menu-sandwich.jpg',
    createdAt: '2024-05-20T00:00:00.000Z',
    updatedAt: '2024-05-20T00:00:00.000Z',
  },
  {
    id: 'menu_2',
    storeId: 'store_1',
    name: '리코타 치킨 샐러드',
    description: '부드러운 리코타 치즈와 닭가슴살 샐러드',
    category: '샐러드',
    price: 8900,
    image: '/images/mock/menu-salad.jpg',
    createdAt: '2024-05-20T00:00:00.000Z',
    updatedAt: '2024-05-20T00:00:00.000Z',
  },
  {
    id: 'menu_3',
    storeId: 'store_1',
    name: '아메리카노 (ICE)',
    description: '깔끔하고 진한 아이스 아메리카노',
    category: '음료',
    price: 4500,
    image: '/images/mock/menu-coffee.jpg',
    createdAt: '2024-05-18T00:00:00.000Z',
    updatedAt: '2024-05-18T00:00:00.000Z',
  },
  {
    id: 'menu_4',
    storeId: 'store_1',
    name: '카페 라떼 (HOT)',
    description: '부드러운 우유와 에스프레소의 조화',
    category: '음료',
    price: 4800,
    image: '/images/mock/menu-latte.jpg',
    createdAt: '2024-05-18T00:00:00.000Z',
    updatedAt: '2024-05-18T00:00:00.000Z',
  },
  {
    id: 'menu_5',
    storeId: 'store_1',
    name: '뉴욕 치즈케이크',
    description: '진한 크림치즈의 풍미가 가득한 케이크',
    category: '디저트',
    price: 6200,
    image: '/images/mock/menu-cheesecake.jpg',
    createdAt: '2024-05-15T00:00:00.000Z',
    updatedAt: '2024-05-15T00:00:00.000Z',
  },
  {
    id: 'menu_6',
    storeId: 'store_1',
    name: '초코칩 쿠키',
    description: '달콤한 초코칩이 가득한 쿠키',
    category: '디저트',
    price: 2500,
    image: '/images/mock/menu-cookie.jpg',
    createdAt: '2024-05-10T00:00:00.000Z',
    updatedAt: '2024-05-10T00:00:00.000Z',
  },
  {
    id: 'menu_7',
    storeId: 'store_1',
    name: '오렌지 주스',
    description: '신선한 오렌지로 만든 생과일 주스',
    category: '음료',
    price: 5000,
    image: '/images/mock/menu-orange.jpg',
    createdAt: '2024-05-10T00:00:00.000Z',
    updatedAt: '2024-05-10T00:00:00.000Z',
  },
  {
    id: 'menu_8',
    storeId: 'store_1',
    name: '단호박 스프',
    description: '달콤하고 부드러운 단호박 스프',
    category: '스프',
    price: 5500,
    image: '/images/mock/menu-soup.jpg',
    createdAt: '2024-05-10T00:00:00.000Z',
    updatedAt: '2024-05-10T00:00:00.000Z',
  },
];

export const mockMenuList: MenuListResponse = {
  items: mockMenus,
  page: 1,
  pageSize: 20,
  totalCount: mockMenus.length,
  totalPages: 1,
};

export const MENU_CATEGORIES = [
  '전체',
  '샌드위치',
  '샐러드',
  '음료',
  '디저트',
  '스프',
];
