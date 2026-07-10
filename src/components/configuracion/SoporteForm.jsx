import { useEffect, useState } from 'react';

function Icon({ name }) {
    return <i data-lucide={name} />;
}

export default function SoporteForm({
    user,
    onSendMessage,
}) {

    const [message, setMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, []);

    async function handleSubmit(e) {

        e.preventDefault();
        setErrorMessage('');

        const result = await onSendMessage(message);

        if (!result.ok) {
            setErrorMessage(result.error);
            return;
        }

        setSuccessMessage(result.message);
        setMessage('');

        setTimeout(() => {
            setSuccessMessage('');
        }, 3000);
    }

    return (
        <div className="config-card animate-fade-in">

            <div className="config-card-header">
                <div>
                    <h2>Centro de Soporte</h2>

                    <p className="card-subtitle">
                        ¿Tuviste un problema con reservas, pagos o clases?
                        Nuestro equipo puede ayudarte.
                    </p>
                </div>

                <div className="support-badge">
                    <Icon name="headphones" />
                    <span>Soporte online</span>
                </div>
            </div>

            <div className="support-info-grid">

                <div className="support-info-card">
                    <Icon name="mail" />
                    <strong>Email</strong>
                    <span>soporte@golahora.com</span>
                </div>

                <div className="support-info-card">
                    <Icon name="clock-3" />
                    <strong>Horario</strong>
                    <span>Lun a Sab · 09:00 a 20:00</span>
                </div>

                <div className="support-info-card">
                    <Icon name="message-circle" />
                    <strong>Respuesta</strong>
                    <span>Dentro de 24hs</span>
                </div>

            </div>

            <form onSubmit={handleSubmit}>

                <div className="input-group block">
                    <label>Usuario</label>

                    <input
                        type="text"
                        value={user?.email || ''}
                        readOnly
                    />
                </div>

                <div className="input-group block">
                    <label>Mensaje</label>

                    <textarea
                        rows="6"
                        placeholder="Describí el inconveniente que tuviste..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    />
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
                        Enviar Mensaje
                    </button>
                </div>

            </form>
        </div>
    );
}
