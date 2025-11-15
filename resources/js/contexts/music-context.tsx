import { createContext, useContext, ReactNode } from 'react';

interface MusicContextType {
    // Contexto para estado global de música si es necesario en el futuro
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function useMusic() {
    const context = useContext(MusicContext);
    if (!context) {
        throw new Error('useMusic must be used within MusicProvider');
    }
    return context;
}

interface MusicProviderProps {
    children: ReactNode;
}

export function MusicProvider({ children }: MusicProviderProps) {
    return (
        <MusicContext.Provider value={{}}>
            {children}
        </MusicContext.Provider>
    );
}

