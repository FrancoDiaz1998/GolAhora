import { createContext, useContext, useState } from 'react';
import { apiRequest } from '../services/apiClient';

const ReportesContext = createContext();

export function ReportesProvider({ children }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getReporte = async (path, desde, hasta) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ desde, hasta });
            return await apiRequest(`${path}?${params.toString()}`);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const generarReporteIngresos = (desde, hasta) => getReporte('/reportes/ingresos', desde, hasta);
    const generarReporteAsistencias = (desde, hasta) => getReporte('/reportes/asistencias', desde, hasta);
    const generarReporteReservas = (desde, hasta) => getReporte('/reportes/reservas', desde, hasta);

    return (
        <ReportesContext.Provider value={{ loading, error, generarReporteIngresos, generarReporteAsistencias, generarReporteReservas }}>
            {children}
        </ReportesContext.Provider>
    );
}

export const useReportes = () => useContext(ReportesContext);
