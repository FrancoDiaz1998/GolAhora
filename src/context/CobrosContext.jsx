import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/apiClient';

const CobrosContext = createContext();

export function CobrosProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setItems(await apiRequest('/cobros'));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const crearItem = async (nuevo) => {
        const creado = await apiRequest('/cobros', { method: 'POST', body: JSON.stringify(nuevo) });
        await fetchItems();
        return creado;
    };

    const modificarItem = async (modificado) => {
        const actualizado = await apiRequest(`/cobros/${modificado.idCobro}`, { method: 'PUT', body: JSON.stringify(modificado) });
        await fetchItems();
        return actualizado;
    };

    const eliminarItem = async (id) => {
        await apiRequest(`/cobros/${id}`, { method: 'DELETE' });
        await fetchItems();
    };

    return (
        <CobrosContext.Provider value={{ items, loading, error, fetchItems, crearItem, modificarItem, eliminarItem }}>
            {children}
        </CobrosContext.Provider>
    );
}

export function useCobros() {
    return useContext(CobrosContext);
}
