import { useState } from 'react'
import React from 'react'
import { useRef } from "react";
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
import { log } from 'firebase/firestore/pipelines';

function App() {
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [input, setInput] = useState(""); // this runs at every render of App but only sets value to "" at the first render other times it uses the state
  // and also hooks should run in same order every render, so conditional hooks create problems

  const inputRef = useRef(null);


  const {
    tasks,
    dropped,
    syncing,
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
        <form // made the callback function async because needed to use await here
          onSubmit={async (e) => {
            e.preventDefault(); // to prevent browser from refreshing and prevent other random behavior on form submit
            let taskAdded = await addTask(input);
            if (!taskAdded.success && taskAdded.message === "Duplicate task") {// if add task failed due to duplicate
              setShowDuplicateModal(true);
              inputRef.current?.blur();
            } else {
              setInput(""); // clearing input field after adding new input
            }
          }}

          className='flex gap-1  *:border-2 *:rounded-md *:py-2 *:px-4' // *: -> used to apply tailwind property to all direct childs
        >
          <input
            ref={inputRef}
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

        <span className='text-xs' // syncing... text
        >{syncing ? "syncing..." : ""}</span>

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

      {/* this is a pop up code it will show pop up based on the state */}
      {/* this expression is evaluated based on how truthy and falsy value expression work in js*/}
      {showDuplicateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">

          <div className="w-72 h-48 rounded-lg bg-white p-4 shadow-xl">

            <h2 className="text-xl font-bold">
              Duplicate Task
            </h2>

            <p className="mt-2 text-gray-600">
              This task already exists and cannot be created again.
            </p>

            <button
              onClick={() => { setShowDuplicateModal(false); inputRef.current?.focus(); }}
              className="mt-5 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              OK
            </button>

          </div>

        </div>
      )}
    </>
  )
}

export default App
