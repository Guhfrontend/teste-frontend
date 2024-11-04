function fetchData() {
  fetch("http://localhost:8080/tarefas")
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro na rede: " + response.statusText);
      }

      return response.json();
    })
    .then(data => {
      console.log("Dados recebidos:", data);
      data.sort((a, b) => a.ordem - b.ordem);
      saveTodos(data);
      renderTodoList(data);
    })
    .catch(error => {
      console.error("Erro na requisição:", error);
    });
}

function renderTodoList(todos) {
  const container = document.getElementById("todoListContainer");
  container.innerHTML = "";

  todos.forEach((todo, index) => {
    const card = document.createElement("div");
    card.classList.add("todo-card");
    card.id = `todo-${todo.id}`;

    if (todo.custo >= 1000) 
      card.style.backgroundColor = '#bcbfa6';
    

    card.innerHTML = `
      <h3>${todo.nome}</h3>
      <p>Preço: R$ ${todo.custo}</p>
      <p>Data Limite: ${new Date(todo.dataLimite).toLocaleDateString()}</p>
      <div>
        <img src="./assets/edit.png" onclick="openEditPopup(${todo.id})" >
        <img src="./assets/trash.png" onclick="deleteTodo(${todo.id})">
        <img src="./assets/up-arrow.png" onclick="moveUp(${index})">
        <img src="./assets/down-arrow.png" onclick="moveDown(${index})">
      </div>
    `;
    container.appendChild(card);
  });
}


function deleteTodo(id) {
  if (confirm("Tem certeza que quer excluir esta tarefa?")) {
    fetch(`http://localhost:8080/tarefas/${id}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Ocorreu um erro ao remover a tarefa.');
        }
        alert('Tarefa removida com sucesso!');
        fetchData();
      })
      .catch(error => {
        console.error(error);
        alert('Ocorreu um erro ao remover a tarefa. Por favor, tente novamente.');
      });
  } else {
    alert('Ação de exclusão cancelada.');
  }
}

function removeAllTodos() {
  if (confirm("Tem certeza que quer remover todas as tarefas?")) {
    fetch("http://localhost:8080/tarefas", {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Ocorreu um erro ao remover todas as tarefas.');
        }
        alert('Todas as tarefas foram removidas com sucesso!');
        fetchData();
      })
      .catch(error => {
        console.error(error);
        alert('Ocorreu um erro ao remover todas as tarefas. Por favor, tente novamente.');
      });
  } else {
    alert('Ação de remoção cancelada.');
  }
}

let currentEditId = null;

function openEditPopup(id) {
  currentEditId = id;
  const todoItem = document.querySelector(`#todo-${id} h3`).innerText;
  const todoCost = document.querySelector(`#todo-${id} p:nth-child(2)`).innerText.replace('Preço: R$ ', '');
  const todoDeadline = document.querySelector(`#todo-${id} p:nth-child(3)`).innerText.split(': ')[1];
  
  document.getElementById('editName').value = todoItem;
  document.getElementById('editCost').value = todoCost;
  document.getElementById('editDeadline').value = new Date(todoDeadline).toISOString().split('T')[0];
  
  document.getElementById('editPopup').style.display = 'block';
}

function closeEditPopup() {
  document.getElementById('editPopup').style.display = 'none';
}

function saveEdit() {
  const editedName = document.getElementById('editName').value;
  const editedCost = parseFloat(document.getElementById('editCost').value);
  const editedDeadline = document.getElementById('editDeadline').value;

  const existingItems = document.querySelectorAll('.todo-card h3');
  for (let item of existingItems) {
    if (item.innerText === editedName && item.parentElement.id !== `todo-${currentEditId}`) {
      alert('Esse nome já existe!');
      return;
    }
  }

  const todoItem = {
    nome: editedName,
    custo: editedCost,
    dataLimite: editedDeadline,
    ordem: currentEditId
  };

  fetch(`http://localhost:8080/tarefas/${currentEditId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(todoItem)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Ocorreu um erro ao editar a tarefa. Por favor, tente novamente.');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      alert('Tarefa editada com sucesso!');
      fetchData();
      closeEditPopup();
    })
    .catch(error => {
      console.error(error);
      alert('Ocorreu um erro ao editar a tarefa. Por favor, tente novamente.');
      fetchData();
      closeEditPopup();
    });
}


function moveUp(index) {
  const todos = getTodos();
  if (index === 0) return;
  [todos[index], todos[index - 1]] = [todos[index - 1], todos[index]];
  updateOrdem(todos);
}

function moveDown(index) {
  const todos = getTodos();
  if (index === todos.length - 1) return; 
  [todos[index], todos[index + 1]] = [todos[index + 1], todos[index]]; 
  updateOrdem(todos);
}



function getTodos() {
  return JSON.parse(localStorage.getItem('todos')) || [];
}

function saveTodos(todos) {
  localStorage.setItem('todos', JSON.stringify(todos));
}


function updateOrdem(todos) {
  todos.forEach((todo, index) => {
    todo.ordem = index + 1; 
    fetch(`http://localhost:8080/tarefas/${todo.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(todo)
    })
    .then(response => response.json())
    .then(data => {
      console.log(`Tarefa ${data.id} atualizada com nova ordem ${data.ordem}`);
    })
    .catch(error => {
      console.error('Erro ao atualizar a ordem:', error);
    });
  });
  renderTodoList(todos);
  saveTodos(todos);
}


document.addEventListener('DOMContentLoaded', () => {
  fetchData();
});