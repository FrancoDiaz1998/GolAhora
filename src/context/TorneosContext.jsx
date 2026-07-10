import { createContext, useContext, useEffect, useState } from 'react';
import { crearResultadoSimulado } from '../utils/fixtures';
import { apiRequest } from '../services/apiClient';

const TorneosContext = createContext();
const MAX_INTEGRANTES_EQUIPO = 16;

function normalizarEquipo(equipo) {
    const integrantes = Array.from(new Set([
        equipo.capitan,
        ...(equipo.integrantes || []),
    ].filter(Boolean)));

    return {
        ...equipo,
        integrantes: integrantes.slice(0, MAX_INTEGRANTES_EQUIPO),
    };
}

export function TorneosProvider({ children }) {
    const [competencias, setCompetencias] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [fixtures, setFixtures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => { fetchDatos(); }, []);

    const fetchDatos = async () => {
        setLoading(true);
        setError(null);
        try {
            const [competenciasData, equiposData, fixturesData] = await Promise.all([
                apiRequest('/competencias'),
                apiRequest('/equipos'),
                apiRequest('/fixtures'),
            ]);
            setCompetencias(competenciasData);
            setEquipos(equiposData);
            setFixtures(fixturesData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const guardarCompetencia = async (comp) => {
        const isEdit = Boolean(comp.id);
        await apiRequest(isEdit ? `/competencias/${comp.id}` : '/competencias', {
            method: isEdit ? 'PUT' : 'POST',
            body: JSON.stringify(comp),
        });
        await fetchDatos();
    };

    const eliminarCompetencia = async (id) => {
        await apiRequest(`/competencias/${id}`, { method: 'DELETE' });
        await fetchDatos();
    };

    const guardarEquipo = async (equipo) => {
        const equipoNormalizado = normalizarEquipo(equipo);
        const isEdit = Boolean(equipoNormalizado.idEquipo);
        await apiRequest(isEdit ? `/equipos/${equipoNormalizado.idEquipo}` : '/equipos', {
            method: isEdit ? 'PUT' : 'POST',
            body: JSON.stringify(equipoNormalizado),
        });
        await fetchDatos();
    };

    const eliminarEquipo = async (id) => {
        await apiRequest(`/equipos/${id}`, { method: 'DELETE' });
        await fetchDatos();
    };

    const inscribirEquipo = async (competenciaId, equipoId) => {
        await apiRequest(`/competencias/${competenciaId}/inscribir`, {
            method: 'POST',
            body: JSON.stringify({ equipoId }),
        });
        await fetchDatos();
    };

    const generarFixture = async (competenciaId) => {
        await apiRequest(`/competencias/${competenciaId}/fixture`, { method: 'POST' });
        await fetchDatos();
    };

    const registrarResultado = async (competenciaId, partidoId, resultado) => {
        await apiRequest(`/fixtures/${competenciaId}/partido/${partidoId}/resultado`, {
            method: 'PATCH',
            body: JSON.stringify({ resultado }),
        });
        await fetchDatos();
    };

    const confirmarResultadoDefinitivo = async () => {
        await fetchDatos();
    };

    const simularFixture = async (competenciaId) => {
        const fixture = fixtures.find(f => f.competenciaID === competenciaId);
        if (!fixture) return;

        for (const ronda of fixture.rondas || []) {
            for (const partido of ronda.partidos || []) {
                if (partido.estado !== 'finalizado') {
                    await registrarResultado(competenciaId, partido.idPartido, crearResultadoSimulado(partido.idPartido));
                }
            }
        }
    };

    return (
        <TorneosContext.Provider value={{
            competencias, equipos, fixtures, loading, error,
            guardarCompetencia, eliminarCompetencia,
            guardarEquipo, eliminarEquipo, inscribirEquipo,
            generarFixture, registrarResultado, confirmarResultadoDefinitivo, simularFixture
        }}>
            {children}
        </TorneosContext.Provider>
    );
}

export const useTorneos = () => useContext(TorneosContext);
