document.getElementById('todoForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const nome = document.getElementById('nome').value
  const custo = document.getElementById('custo').value
  const dataLimite = document.getElementById('dataLimite').value

  const numero = parseFloat(custo);

  if (custo < 0) { 
    alert('O custo da tarefa deve ser maior ou igual a zero.'); return; 
}


  function sorteio() {
    return Math.floor(Math.random() * 1000);
  } 

  const todoItem = {
    nome: nome,
    custo: numero,
    dataLimite: dataLimite,
    ordem: sorteio()
  }

  fetch('https://teste-backend-crfz.onrender.com/tarefas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(todoItem)
  })
    .then(response => {
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Nome já existe.');
        } else {
          throw new Error('Erro ao adicionar a tarefa.');
        }
      }
      return response.json();
    })
    .then(data => {
      if(custo < 0) {
        alert('O custo da tarefa deve ser maior ou igual a zero.');
        return;
      }else{
      console.log(data);
      alert('Tarefa adicionada com sucesso!');
      window.location.href = '../index.html';
}
})
    .catch(error => {
      console.error(error);
      alert(error.message);
    });
});
