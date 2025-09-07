import React from 'react';

function Alert({ alert, onClose }) {
    if (!alert) return null;
    return (
        <div className={`alert alert-${alert.type} alert-dismissible fade show mt-3`} role="alert">
            {alert.message}
            <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
    );
}

export default Alert;