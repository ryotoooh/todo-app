<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ config('app.name', 'Laravel') }}</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap" rel="stylesheet">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>

    <style>
        body {
            font-family: 'IBM Plex Sans', sans-serif;
        }
        .todo-item {
            margin-bottom: 10px;
        }
        .loading {
            text-align: center;
            padding: 20px;
        }
    </style>
</head>

<body class="bg-gray-100">
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <h1>Todo</h1>
                
                <!-- Todo List Container -->
                <div id="todos-container">
                    <div class="loading">Loading todos...</div>
                </div>

                <!-- Create Todo Form -->
                <div class="card mt-4">
                    <div class="card-body">
                        <h5 class="card-title">Add New Todo</h5>
                        <form id="todo-form">
                            @csrf
                            <div class="mb-3">
                                <input type="text" name="title" id="title" class="form-control" placeholder="Title" required>
                            </div>
                            <div class="mb-3">
                                <input type="text" name="description" id="description" class="form-control" placeholder="Description">
                            </div>
                            <button type="submit" class="btn btn-primary">Create Todo</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Function to fetch and display todos
        async function fetchTodos() {
            try {
                const response = await fetch('/api/todos');
                const todos = await response.json();
                
                const container = document.getElementById('todos-container');
                
                if (todos.length === 0) {
                    container.innerHTML = '<div class="alert alert-info">No todos found. Create your first todo!</div>';
                    return;
                }
                
                let html = '';
                todos.forEach(todo => {
                    const statusClass = todo.is_done ? 'text-decoration-line-through text-muted' : '';
                    const statusBadge = todo.is_done ? '<span class="badge bg-success">Done</span>' : '<span class="badge bg-warning">Pending</span>';
                    
                    html += `
                        <div class="card todo-item">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h5 class="card-title ${statusClass}">${todo.title}</h5>
                                        ${todo.description ? `<p class="card-text ${statusClass}">${todo.description}</p>` : ''}
                                        <small class="text-muted">Created: ${new Date(todo.created_at).toLocaleString()}</small>
                                    </div>
                                    <div>
                                        ${statusBadge}
                                        <button class="btn btn-sm btn-outline-primary ms-2" onclick="toggleTodo(${todo.id})">
                                            ${todo.is_done ? 'Mark Undone' : 'Mark Done'}
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger ms-1" onclick="deleteTodo(${todo.id})">Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                container.innerHTML = html;
            } catch (error) {
                console.error('Error fetching todos:', error);
                document.getElementById('todos-container').innerHTML = '<div class="alert alert-danger">Error loading todos. Please try again.</div>';
            }
        }

        // Function to create a new todo
        async function createTodo(title, description) {
            try {
                const response = await fetch('/api/todos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                                       document.querySelector('input[name="_token"]')?.value
                    },
                    body: JSON.stringify({
                        title: title,
                        description: description,
                        is_done: false
                    })
                });

                if (response.ok) {
                    // Clear form
                    document.getElementById('title').value = '';
                    document.getElementById('description').value = '';
                    
                    // Refresh todos list
                    await fetchTodos();
                    
                    // Show success message
                    showAlert('Todo created successfully!', 'success');
                } else {
                    const error = await response.json();
                    showAlert('Error creating todo: ' + (error.message || 'Unknown error'), 'danger');
                }
            } catch (error) {
                console.error('Error creating todo:', error);
                showAlert('Error creating todo. Please try again.', 'danger');
            }
        }

        // Function to toggle todo status
        async function toggleTodo(id) {
            try {
                // First get the current todo to check its status
                const getResponse = await fetch(`/api/todos/${id}`);
                const todo = await getResponse.json();
                
                const response = await fetch(`/api/todos/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                                       document.querySelector('input[name="_token"]')?.value
                    },
                    body: JSON.stringify({
                        title: todo.title,
                        description: todo.description,
                        is_done: !todo.is_done
                    })
                });

                if (response.ok) {
                    await fetchTodos();
                    showAlert('Todo updated successfully!', 'success');
                } else {
                    showAlert('Error updating todo', 'danger');
                }
            } catch (error) {
                console.error('Error updating todo:', error);
                showAlert('Error updating todo. Please try again.', 'danger');
            }
        }

        // Function to delete todo
        async function deleteTodo(id) {
            if (!confirm('Are you sure you want to delete this todo?')) {
                return;
            }

            try {
                const response = await fetch(`/api/todos/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                                       document.querySelector('input[name="_token"]')?.value
                    }
                });

                if (response.ok) {
                    await fetchTodos();
                    showAlert('Todo deleted successfully!', 'success');
                } else {
                    showAlert('Error deleting todo', 'danger');
                }
            } catch (error) {
                console.error('Error deleting todo:', error);
                showAlert('Error deleting todo. Please try again.', 'danger');
            }
        }

        // Function to show alert messages
        function showAlert(message, type) {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
            alertDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            // Insert alert at the top of the container
            const container = document.querySelector('.container');
            container.insertBefore(alertDiv, container.firstChild);
            
            // Auto-dismiss after 3 seconds
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 3000);
        }

        // Form submission handler
        document.getElementById('todo-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const title = document.getElementById('title').value.trim();
            const description = document.getElementById('description').value.trim();
            
            if (!title) {
                showAlert('Please enter a title for the todo.', 'warning');
                return;
            }
            
            await createTodo(title, description);
        });

        // Load todos when page loads
        document.addEventListener('DOMContentLoaded', function() {
            fetchTodos();
        });
    </script>
</body>

</html>