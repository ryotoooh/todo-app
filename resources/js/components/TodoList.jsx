import React from 'react';

function TodoList({ todos, loading, onToggle, onDelete }) {
    if (loading) {
        return <div className="loading text-center p-3">Loading todos...</div>;
    }

    if (!todos || todos.length === 0) {
        return <div className="alert alert-info">No todos found. Create your first todo!</div>;
    }

    return (
        <>
            {todos.map((todo) => {
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
                                        onClick={() => onToggle(todo.id)}
                                    >
                                        {todo.is_done ? 'Mark Undone' : 'Mark Done'}
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger ms-1"
                                        onClick={() => onDelete(todo.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
}

export default TodoList;