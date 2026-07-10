import { useEffect, useState } from 'react';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

export default function SeguridadForm({
    onChangePassword,
}) {

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, []);

    function handleChange(e) {

        const { name, value } = e.target;

        setPasswordData(prev => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(e) {

        e.preventDefault();

        setSuccessMessage('');
        setErrorMessage('');

        const result = await onChangePassword(passwordData);

        if (!result.ok) {
            setErrorMessage(result.error);
            return;
        }

        setSuccessMessage(result.message);

        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });

        setTimeout(() => {
            setSuccessMessage('');
        }, 3000);
    }

    return (
        <div className="config-card animate-fade-in">

            <div className="config-card-header">
                <div>
                    <h2>Seguridad de la Cuenta</h2>

                    <p className="card-subtitle">
                        Cambiá tu contraseña y mantené protegida tu cuenta.
                    </p>
                </div>

                <div className="security-badge">
                    <Icon name="shield" />
                    <span>Seguridad activa</span>
                </div>
            </div>

            <form onSubmit={handleSubmit}>

                <div className="input-group block">
                    <label>Contraseña Actual</label>

                    <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group block">
                    <label>Nueva Contraseña</label>

                    <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="input-group block">
                    <label>Confirmar Nueva Contraseña</label>

                    <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="security-rules">
                    <h4>Recomendaciones</h4>

                    <ul>
                        <li>Mínimo 6 caracteres</li>
                        <li>Utilizar números y letras</li>
                        <li>No compartir tu contraseña</li>
                    </ul>
                </div>

                {successMessage && (
                    <div className="form-alert success">
                        <Icon name="check-circle" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {errorMessage && (
                    <div className="form-alert error">
                        <Icon name="circle-alert" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                <div className="config-actions">
                    <button
                        type="submit"
                        className="btn-save"
                    >
                        Actualizar Contraseña
                    </button>
                </div>

            </form>
        </div>
    );
}
