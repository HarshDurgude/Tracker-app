import { useState } from 'react'
import React from 'react'
import './App.css'

// dnd imports
import {
  SortableContext,
  arrayMove
} from "@dnd-kit/sortable";
import {
  DndContext,
} from "@dnd-kit/core";

// custom hooks and components
import TaskItem from './components/TaskItem';
import useTasks from './hooks/useTasks';

function App() {
  const [input, setInput] = useState("");


  const {
    tasks,
    dropped,
    loading,
    addTask,
    deleteTask,
    toggleTask,
    handleDragEnd,
    handleDragStart
  } = useTasks(); // custom hook created to handle all task related logic


  return (
    <>
      <div className='m-4 flex flex-col items-center'>
        {/* made the div into form and moved add task logic to onsubmit, so that pressing enter also creates the task in todo list */}
        <form
          onSubmit={(e) => {
            e.preventDefault(); // to prevent browser from refreshing and prevent other random behavior on form submit
            addTask(input);
            setInput(""); // clearing input field after adding new input
          }}
          className='flex gap-1  *:border-2 *:rounded-md *:py-2 *:px-4' // *: -> used to apply tailwind property to all direct childs
        >
          <input
            className='w-64' // approx width based on what looks good
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }} />
          <button
            className='px-'
            type='submit' //so the onSubmit code runs when this button pressed
          >Add </button>
        </form>

        <span className='text-xs'>{loading ? "syncing..." : ""}</span>

        <div className='m-2'>
          <DndContext // defines the context of drag an drop area

            onDragStart={() => { handleDragStart() }}
            onDragEnd={(event) => { handleDragEnd(event) }}
          >

            <SortableContext // defines the items which will be used for drag and drop
              items={tasks.map(task => task.id)}
            >

              {tasks.map((task) => (
                <TaskItem
                  task={task}
                  toggleTask={toggleTask}
                  deleteTask={deleteTask}
                  dropped={dropped}
                  key={task.id}
                />
              ))}

            </SortableContext>



          </DndContext>
        </div>

      </div>
    </>
  )
}

export default App
