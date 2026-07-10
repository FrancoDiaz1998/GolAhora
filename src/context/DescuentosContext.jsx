import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../services/apiClient';

const DescuentosContext = createContext();

const normalizarDescuento = (descuento) => ({
    ...descuento,
    codigo: String(descuento.codigo || '').trim().toUpperCase(),
    porcentaje: Number(descuento.porcentaje || 0),
    activo: descuento.activo !== false,
});

export function DescuentosProvider({ children }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiRequest('/descuentos');
            setItems(data.map(normalizarDescuento));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const crearItem = async (nuevo) => {
        const creado = await apiRequest('/descuentos', { method: 'POST', body: JSON.stringify(normalizarDescuento(nuevo)) });
        await fetchItems();
        return creado;
    };

    const modificarItem = async (modificado) => {
        const item = normalizarDescuento(modificado);
        const actualizado = await apiRequest(`/descuentos/${item.id}`, { method: 'PUT', body: JSON.stringify(item) });
        await fetchItems();
        return actualizado;
    };

    const eliminarItem = async (id) => {
        await apiRequest(`/descuentos/${id}`, { method: 'DELETE' });
        await fetchItems();
    };

    const buscarPorCodigo = (codigo) => {
        const normalizado = String(codigo || '').trim().toUpperCase();
        return items.find(d => d.activo && d.codigo === normalizado) || null;
    };

    return (
        <DescuentosContext.Provider value={{
            items,
            descuentos: items,
            loading,
            error,
            fetchItems,
            crearItem,
            modificarItem,
            eliminarItem,
            buscarPorCodigo,
        }}>
            {children}
        </DescuentosContext.Provider>
    );
}

export function useDescuentos() {
    const context = useContext(DescuentosContext);
    if (!context) throw new Error('useDescuentos debe usarse dentro de DescuentosProvider');
    return context;
}
