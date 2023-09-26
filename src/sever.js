const express = require('express');
const fs = require('fs');
const app = express();
const port = 3001;

app.use(express.json());

// CORS 설정을 특정 도메인으로 제한
const allowedOrigins = ['http://example.com']; // 허용할 도메인으로 업데이트
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

let todos = [];

try {
  const data = fs.readFileSync('./Todo.json');
  todos = JSON.parse(data).todos;
} catch (err) {
  console.error('JSON 파일 읽기 오류:', err);
}

app.get('/getTodos', (req, res) => {
  res.json({ todos });
});

app.post('/addTodo', (req, res) => {
  const newTodo = req.body.newTodo;
  todos.push(newTodo);

  // 데이터를 JSON 파일에 저장
  saveTodosToFile();

  res.json({ todos });
});

app.put('/updateTodo', (req, res) => {
  const updatedTodos = req.body.updatedTodos;
  todos = updatedTodos;

  // 데이터를 JSON 파일에 저장
  saveTodosToFile();

  res.json({ todos });
});

app.delete('/deleteTodo/:id', (req, res) => {
  const idToDelete = parseInt(req.params.id, 10);
  todos = todos.filter((todo) => todo.id !== idToDelete);

  // 데이터를 JSON 파일에 저장
  saveTodosToFile();

  res.json({ todos });
});

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});

function saveTodosToFile() {
  // 데이터를 JSON 파일에 저장하는 함수
  fs.writeFileSync('./Todo.json', JSON.stringify({ todos }));
}
