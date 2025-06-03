import { createContext, useContext, useState, ReactNode } from 'react';
import { Student } from '../data/students';
import { Mosque } from '../data/mosques';

interface AppContextProps {
  currentMosque: Mosque | null;
  setCurrentMosque: (mosque: Mosque | null) => void;
  selectedStudent: Student | null;
  setSelectedStudent: (student: Student | null) => void;
  memorizationMode: 'حفظ' | 'مراجعة صغرى' | 'مراجعة كبرى' | null;
  setMemorizationMode: (mode: 'حفظ' | 'مراجعة صغرى' | 'مراجعة كبرى' | null) => void;
  isSessionActive: boolean;
  setIsSessionActive: (active: boolean) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentMosque, setCurrentMosque] = useState<Mosque | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [memorizationMode, setMemorizationMode] = useState<'حفظ' | 'مراجعة صغرى' | 'مراجعة كبرى' | null>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);

  return (
    <AppContext.Provider 
      value={{
        currentMosque,
        setCurrentMosque,
        selectedStudent,
        setSelectedStudent,
        memorizationMode,
        setMemorizationMode,
        isSessionActive,
        setIsSessionActive
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
