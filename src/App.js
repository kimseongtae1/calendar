import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { KakaoMap } from './KakaoMap';
import './App.scss';

function App() {
  const [date, setDate] = useState(new Date());
  const [todos, setTodos] = useState([]);
  const [destination, setDestination] = useState('');
  const [address, setAddress] = useState('');
  const [content, setContent] = useState('');
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [coords, setCoords] = useState({ latitude: 37.5665, longitude: 126.9780 });
  const [mapVisible, setMapVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const todosPerPage = 2;

  useEffect(() => {
    const storedTodos = JSON.parse(localStorage.getItem('todos'));
    const storedMarkers = JSON.parse(localStorage.getItem('markers'));

    if (storedTodos) {
      setTodos(storedTodos);
    }

    if (storedMarkers) {
      setCoords(storedMarkers.coords);
      setMapVisible(storedMarkers.mapVisible);
    }
  }, []);

  useEffect(() => {
    // 페이지가 처음 로드될 때 현재 날짜의 일정을 불러옵니다.
    fetch(`/todos?date=${date.toDateString()}`)
      .then((response) => response.json())
      .then((data) => {
        setTodos(data.todos);
        const storedMarkers = { coords, mapVisible: true };
        updateLocalStorage(data.todos, storedMarkers);
      })
      .catch((error) => {
        console.error('데이터 불러오기 중 오류 발생:', error);
      });
  }, [date]);

  const updateLocalStorage = (updatedTodos, updatedMarkers) => {
    localStorage.setItem('todos', JSON.stringify(updatedTodos));
    localStorage.setItem('markers', JSON.stringify(updatedMarkers));
  };

  const updateCoordsFromAddress = (newAddress) => {
    if (newAddress.trim() === '') return;

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(newAddress, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        const newCoords = {
          latitude: result[0].y,
          longitude: result[0].x,
        };
        setCoords(newCoords);
      } else {
        console.error('주소를 좌표로 변환할 수 없습니다.');
      }
    });
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setEditingTodoId(null);
    setCurrentPage(1);
  };

  const addTodo = () => {
    if (destination.trim() === '' || address.trim() === '' || content.trim() === '') return;

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        const newCoords = {
          latitude: result[0].y,
          longitude: result[0].x,
        };

        const newTodo = {
          id: todos.length + 1,
          date: date.toDateString(),
          destination: destination,
          address: address,
          content: content,
          latitude: newCoords.latitude,
          longitude: newCoords.longitude,
        };

        fetch('/addTodo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newTodo }),
        })
          .then(() => {
            const updatedTodos = [...todos, newTodo];
            setTodos(updatedTodos);
            setDestination('');
            setAddress('');
            setContent('');
            setMapVisible(true);
            setCoords(newCoords);

            const storedMarkers = { coords: newCoords, mapVisible: true };
            updateLocalStorage(updatedTodos, storedMarkers);
          })
          .catch((error) => {
            console.error('JSON 데이터 업데이트 중 오류 발생:', error);
          });
      } else {
        console.error('주소를 좌표로 변환할 수 없습니다.');
      }
    });
  };

  const editTodo = (id) => {
    const todoToEdit = todos.find((todo) => todo.id === id);
    if (todoToEdit) {
      setEditingTodoId(id);
      setDestination(todoToEdit.destination);
      setAddress(todoToEdit.address);
      setContent(todoToEdit.content);

      updateCoordsFromAddress(todoToEdit.address);
    }
  };

  const saveEdit = () => {
    if (destination.trim() === '' || address.trim() === '' || content.trim() === '') return;

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        const updatedCoords = {
          latitude: result[0].y,
          longitude: result[0].x,
        };

        const updatedTodos = todos.map((todo) => {
          if (todo.id === editingTodoId) {
            return {
              ...todo,
              destination: destination,
              address: address,
              content: content,
              latitude: updatedCoords.latitude,
              longitude: updatedCoords.longitude,
            };
          }
          return todo;
        });

        fetch('/updateTodo', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ updatedTodos }),
        })
          .then(() => {
            setTodos(updatedTodos);
            setEditingTodoId(null);
            setDestination('');
            setAddress('');
            setContent('');
            setMapVisible(true);
            setCoords(updatedCoords);

            const storedMarkers = { coords: updatedCoords, mapVisible: true };
            updateLocalStorage(updatedTodos, storedMarkers);
          })
          .catch((error) => {
            console.error('JSON 데이터 업데이트 중 오류 발생:', error);
          });
      } else {
        console.error('주소를 좌표로 변환할 수 없습니다.');
      }
    });
  };

  const deleteTodo = (id) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);

    fetch(`/deleteTodo/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setTodos(updatedTodos);
        setEditingTodoId(null);
        setDestination('');
        setAddress('');
        setContent('');
        setMapVisible(true);
        updateCoordsFromAddress(address);
      })
      .catch((error) => {
        console.error('JSON 데이터 삭제 중 오류 발생:', error);
      });
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toDateString();
      const todoCount = todos.filter((todo) => todo.date === dateStr).length;
      if (todoCount > 0) {
        return <div className={`todo-count ${dateStr === date.toDateString() ? 'active' : ''}`}>{todoCount}</div>;
      }
    }
    return null;
  };

  const handleTodoItemClick = (latitude, longitude) => {
    setCoords({ latitude, longitude });
  };

  return (
    <div className="App">
      <div className="calendar-container">
        <Calendar onChange={handleDateChange} value={date} tileContent={tileContent} />
      </div>
      <div className="todo-container">
        <h2>{date.toDateString()}의 일정</h2>
        <input type="text" placeholder="목적지 입력" value={destination} onChange={(e) => setDestination(e.target.value)} />
        <input type="text" placeholder="주소 입력" value={address} onChange={(e) => setAddress(e.target.value)} />
        <input type="text" placeholder="내용 입력" value={content} onChange={(e) => setContent(e.target.value)} />
        {editingTodoId === null ? (
          <button onClick={addTodo}>추가</button>
        ) : (
          <button onClick={saveEdit}>저장</button>
        )}
        <ul>
          {todos
            .filter((todo) => todo.date === date.toDateString())
            .slice((currentPage - 1) * todosPerPage, currentPage * todosPerPage)
            .map((todo) => (
              <li key={todo.id} onClick={() => handleTodoItemClick(todo.latitude, todo.longitude)}>
                <div>목적지: {todo.destination}</div>
                <div>주소: {todo.address}</div>
                <div>내용: {todo.content}</div>
                <button onClick={() => editTodo(todo.id)}>수정</button>
                <button onClick={() => deleteTodo(todo.id)}>삭제</button>
              </li>
            ))}
        </ul>
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            이전 
          </button>
          <span>{currentPage}</span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={
              currentPage === Math.ceil(
                todos.filter((todo) => todo.date === date.toDateString()).length / todosPerPage
              )
            }
          >
            다음 
          </button>
        </div>
      </div>
      {mapVisible && <KakaoMap latitude={coords.latitude} longitude={coords.longitude} markers={todos} />}
    </div>
  );
}

export default App;
