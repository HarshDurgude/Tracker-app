import { useState } from 'react'
import './App.css'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { DndContext } from "@dnd-kit/core";

import TaskItem from './components/TaskItem';


function App() {
  const [dropped, setDropped] = useState();
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  function addTask() {
    if (input.trim() !== "") {
      setTasks([...tasks, { id: Date.now(), title: input, status: false }]);
      // ... --> it is called spread oprator, works just as it looks
      setInput("");
    }
  }
  function deleteTask(id) {
    setTasks(tasks.filter((task, i) => (task.id !== id)));
    // react prefers creating new arrays instead of modifiying old ones for state change
    // filter creates new array
  }

  function toggleTask(id) {
    setTasks(tasks.map((t) => (t.id === id) ? { ...t, status: !t.status } : t))
  }

  return (
    <>
      <div className='m-4 flex flex-col items-center'>
        {/* made the div into form and moved add task logic to onsubmit, so that pressing enter also creates the task in todo list */}
        <form onSubmit={(e) => {
          e.preventDefault();
          addTask();
        }} className='flex gap-1  *:border-2 *:rounded-md *:py-2 *:px-4'>
          <input
            className='w-64'
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


        <div className='h-full bg-amber-200' >
          <DndContext

            // sensors={sensors}
            onDragStart={() => setDropped(false)}
            onDragEnd={(event) => {
              setTasks(arrayMove(tasks, tasks.findIndex(t => t.id === event.active.id), tasks.findIndex(t => t.id === event.over.id)))
              setDropped(true)
            }}
          >

            <SortableContext
              items={tasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}

            >
              {tasks.map((task) => (
                <TaskItem
                  task={task}
                  toggleTask={toggleTask}
                  deleteTask={deleteTask}
                  dropped={dropped}

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
