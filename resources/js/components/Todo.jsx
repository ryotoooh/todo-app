import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import useTodos from '../hooks/useTodos';

function Todo() {
    const { todos, loading, alert, setAlert, createTodo, toggleTodo, deleteTodo } = useTodos();
    const [form, setForm] = useState({ title: '', description: '' });

    function showLocalAlert(message, type = 'info') {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    }

    function onSubmit(e) {
        e.preventDefault();
        const title = form.title.trim();
        const description = form.description.trim();
        if (!title) {
            showLocalAlert('Please enter a title for the todo.', 'warning');
            return;
        }
        createTodo(title, description).then((ok) => {
            if (ok) {
                setForm({ title: '', description: '' });
            }
        });
    }

    return (
        <div className="container">
            {alert && (
                <div className={`alert alert-${alert.type} alert-dismissible fade show mt-3`} role="alert">
                    {alert.message}
                    <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
                </div>
            )}

            <div className="row">
                <div className="col-md-12">
                    <h1 className="mt-3">Todo</h1>

                    <div id="todos-container" className="mt-3">
                        {loading ? (
                            <div className="loading text-center p-3">Loading todos...</div>
                        ) : todos.length === 0 ? (
                            <div className="alert alert-info">No todos found. Create your first todo!</div>
                        ) : (
                            todos.map((todo) => {
                                const statusClass = todo.is_done ? 'text-decoration-line-through text-muted' : '';
                                const statusBadge = todo.is_done
                                    ? <span className="badge bg-success">Done</span>
                                    : <span className="badge bg-warning">Pending</span>;
                                return (
                                    <div key={todo.id} className="card todo-item mb-2">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h5 className={`card-title ${statusClass}`}>{todo.title}</h5>
                                                    {todo.description ? (
                                                        <p className={`card-text ${statusClass}`}>{todo.description}</p>
                                                    ) : null}
                                                    {todo.created_at ? (
                                                        <small className="text-muted">
                                                            Created: {new Date(todo.created_at).toLocaleString()}
                                                        </small>
                                                    ) : null}
                                                </div>
                                                <div>
                                                    {statusBadge}
                                                    <button
                                                        className="btn btn-sm btn-outline-primary ms-2"
                                                        onClick={() => toggleTodo(todo.id)}
                                                    >
                                                        {todo.is_done ? 'Mark Undone' : 'Mark Done'}
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger ms-1"
                                                        onClick={() => deleteTodo(todo.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="card mt-4">
                        <div className="card-body">
                            <h5 className="card-title">Add New Todo</h5>
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
                                <button type="submit" className="btn btn-primary">Create Todo</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Todo;

if (document.getElementById('app')) {
    const Index = ReactDOM.createRoot(document.getElementById('app'));
    Index.render(
        <React.StrictMode>
            <Todo />
        </React.StrictMode>
    );
}