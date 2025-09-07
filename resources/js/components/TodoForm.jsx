import React, { useState } from 'react';

function TodoForm({ onCreate, onShowAlert }) {
    const [form, setForm] = useState({ title: '', description: '' });
    const [submitting, setSubmitting] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        const title = form.title.trim();
        const description = form.description.trim();

        if (!title) {
            onShowAlert?.('Please enter a title for the todo.', 'warning');
            return;
        }

        try {
            setSubmitting(true);
            const ok = await onCreate?.(title, description);
            if (ok) {
                setForm({ title: '', description: '' });
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form id="todo-form" onSubmit={onSubmit}>
            <div className="mb-3">
                <input
                    type="text"
                    name="title"
                    id="title"
                    className="form-control"
                    placeholder="Title"
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
            </div>
            <div className="mb-3">
                <input
                    type="text"
                    name="description"
                    id="description"
                    className="form-control"
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Todo'}
            </button>
        </form>
    );
}

export default TodoForm;