import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function CalendarComponent() {
  const [date, setDate] = useState(new Date());

  const handleDateChange = (newDate) => {
    setDate(newDate);
    // 여기에서 선택한 날짜를 API로 전달하거나 다른 작업을 수행할 수 있습니다.
  };

  return (
    <div>
      <h1>달력 API 예제</h1>
      <Calendar onChange={handleDateChange} value={date} />
    </div>
  );
}

export default CalendarComponent;
