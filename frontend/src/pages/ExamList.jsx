import React from 'react'

export default function ExamList({ exams }) {
  return (
    <div className='p-6'>
      <h2 className='mb-4 text-2xl font-bold'>Your Exam Schedule</h2>
      <ul className='space-y-3'>
        {exams.map((exam, index) => (
          <li key={index} className='p-4 border rounded-lg'>
            <p className='text-xl font-bold'>{exam.name}</p>
            <p>{exam.date} • {exam.time} • {exam.room}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
