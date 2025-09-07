import { useEffect, useState } from 'react';

function useTodos() {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

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
                await fetchTodos();
                showAlert('Todo created successfully!', 'success');
                return true;
            } else {
                let error;
                try {
                    error = await res.json();
                } catch (_) {}
                showAlert('Error creating todo' + (error?.message ? `: ${error.message}` : ''), 'danger');
                return false;
            }
        } catch (e) {
            console.error('Error creating todo:', e);
            showAlert('Error creating todo. Please try again.', 'danger');
            return false;
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

    useEffect(() => {
        fetchTodos();
    }, []);

    return {
        todos,
        loading,
        alert,
        setAlert,
        fetchTodos,
        createTodo,
        toggleTodo,
        deleteTodo,
    };
}

export default useTodos;