// بيانات المساجد (المدارس القرآنية)
export interface Mosque {
  id: string;
  name: string;
  location: string;
  studentsCount: number;
}

export const mosques: Mosque[] = [
  {
    id: '1',
    name: 'جامع هيلة الحربي',
    location: 'الرياض، حي النهضة',
    studentsCount: 42
  },
  {
    id: '2',
    name: 'جامع سالم العجيمي',
    location: 'الرياض، حي الياسمين',
    studentsCount: 38
  },
  {
    id: '3',
    name: 'جامع الإمام محمد بن سعود',
    location: 'الرياض، حي العليا',
    studentsCount: 55
  },
  {
    id: '4',
    name: 'جامع الملك خالد',
    location: 'الرياض، حي الملقا',
    studentsCount: 36
  }
];
