import React from 'react';
import ReactDOM from 'react-dom/client';
import useTodos from '../hooks/useTodos';
import Alert from './Alert';
import TodoList from './TodoList';
import TodoForm from './TodoForm';

function Todo() {
    const { todos, loading, alert, setAlert, createTodo, toggleTodo, deleteTodo } = useTodos();

    function showLocalAlert(message, type = 'info') {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    }

    async function handleCreate(title, description) {
        const ok = await createTodo(title.trim(), description.trim());
        return ok;
    }

    return (
        <div className="container">
            <Alert alert={alert} onClose={() => setAlert(null)} />

            <div className="row">
                <div className="col-md-12">
                    <h1 className="mt-3">Todo</h1>

                    <div id="todos-container" className="mt-3">
                        <TodoList
                            todos={todos}
                            loading={loading}
                            onToggle={toggleTodo}
                            onDelete={deleteTodo}
                        />
                    </div>

                    <div className="card mt-4">
                        <div className="card-body">
                            <h5 className="card-title">Add New Todo</h5>
                            <TodoForm
                                onCreate={handleCreate}
                                onShowAlert={showLocalAlert}
                            />
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