import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

function Todo() {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [form, setForm] = useState({ title: '', description: '' });

    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            || document.querySelector('input[name="_token"]')?.value
            || '';
    }

    function showAlert(message, type = 'info', timeoutMs = 3000) {
        setAlert({ message, type });
        if (timeoutMs > 0) {
            setTimeout(() => setAlert(null), timeoutMs);
        }
    }

    async function fetchTodos() {
        try {
            setLoading(true);
            const res = await fetch('/api/todos');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setTodos(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Error fetching todos:', e);
            showAlert('Error loading todos. Please try again.', 'danger');
        } finally {
            setLoading(false);
        }
    }

    async function createTodo(title, description) {
        try {
            const res = await fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    is_done: false,
                }),
            });

            if (res.ok) {
                setForm({ title: '', description: '' });
                await fetchTodos();
                showAlert('Todo created successfully!', 'success');
            } else {
                let error;
                try {
                    error = await res.json();
                } catch (_) {}
                showAlert('Error creating todo' + (error?.message ? `: ${error.message}` : ''), 'danger');
            }
        } catch (e) {
            console.error('Error creating todo:', e);
            showAlert('Error creating todo. Please try again.', 'danger');
        }
    }

    async function toggleTodo(id) {
        try {
            const getRes = await fetch(`/api/todos/${id}`);
            if (!getRes.ok) throw new Error('Failed to get todo');
            const todo = await getRes.json();

            const res = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    title: todo.title,
                    description: todo.description,
                    is_done: !todo.is_done,
                }),
            });

            if (res.ok) {
                await fetchTodos();
                showAlert('Todo updated successfully!', 'success');
            } else {
                showAlert('Error updating todo', 'danger');
            }
        } catch (e) {
            console.error('Error updating todo:', e);
            showAlert('Error updating todo. Please try again.', 'danger');
        }
    }

    async function deleteTodo(id) {
        if (!window.confirm('Are you sure you want to delete this todo?')) {
            return;
        }
        try {
            const res = await fetch(`/api/todos/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            if (res.ok) {
                await fetchTodos();
                showAlert('Todo deleted successfully!', 'success');
            } else {
                showAlert('Error deleting todo', 'danger');
            }
        } catch (e) {
            console.error('Error deleting todo:', e);
            showAlert('Error deleting todo. Please try again.', 'danger');
        }
    }

    function onSubmit(e) {
        e.preventDefault();
        const title = form.title.trim();
        const description = form.description.trim();
        if (!title) {
            showAlert('Please enter a title for the todo.', 'warning');
            return;
        }
        createTodo(title, description);
    }

    useEffect(() => {
        fetchTodos();
    }, []);

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