import React from 'react'
import {
    useSortable,
    defaultAnimateLayoutChanges
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";


// solves the glitch which we prev used to solve with dropped state
const animateLayoutChanges = (args) => {
    if (args.isSorting || args.wasDragging) {
        return defaultAnimateLayoutChanges(args);
    }

    return true;
};
function TaskItem({ task, toggleTask, deleteTask, collectionName }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        animateLayoutChanges
    }); // hook which gives diff utilities for drag and drop

    const style = { // handles dragging, movement and translate animation using dynamic css
        transform: CSS.Transform.toString(transform),
        transition: transition?.replace("200ms", "300ms"),

        // for solving the z-index glitch
        position: "relative",
        zIndex: isDragging ? 999 : 0,

    };

    return (
        <div

            ref={setNodeRef} // marking this div as dragable and telling that to dnd kit
            style={style}
            data-task-id={task.id}
        >

            <div className={`flex gap-1.5 items-center my-1.5  py-0.5 px-1.5 rounded-lg ${isDragging ? "bg-gray-200 shadow-lg z-100" : "bg-gray-100 shadow-sm"}`} >
                {collectionName === "tasks" && <div
                    className="leading-none p-1 font-bold bg-gray-300 rounded-sm touch-none  hover:bg-gray-400 hover:cursor-pointer"
                    // for making this div the drag control point
                    {...listeners}
                    // for realiable dragging
                    {...attributes}
                >
                    ::
                </div>}
                <button
                    className='border-2 px-0.5 m-1 rounded-sm bg-red-200 hover:bg-red-400'
                    onClick={() => deleteTask(task.id)}
                // in react event handlers we need to pass a arrow func and call our func itside it because calling 
                // our func directly will execute it immediately when component renders
                >Delete</button>
                <p className='w-48'>{task.title}</p>
                {/* added fixed width to move all checkboxes to the end */}
                <label
                    className='p-1.5 hover:bg-gray-100 rounded-sm'
                // using label so that clicking on the lable also triggers click for the checkbox, because thats what lables are for
                >
                    <input
                        className='m-1'
                        type="checkbox"
                        checked={task.status}
                        // instead of onclick onChange is recommended for checkboxes
                        // onChange={() => toggleTask(task.id)}
                        onChange={() => toggleTask(task.id)}
                    />
                </label>
            </div>
        </div>
    )
}

export default TaskItem