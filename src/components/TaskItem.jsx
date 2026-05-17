import React from 'react'
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities";
function TaskItem({ task, toggleTask, deleteTask, dropped }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id: task.id }); // hook which gives diff utilities for drag and drop

    const style = { // handles dragging, movement and translate animation using dynamic css
        transform: CSS.Transform.toString(transform),
        transition: dropped ? "none" : transition, // workaround to fix the gitter/glich
    };
    return (
        <div

            ref={setNodeRef} // marking this div as dragable and telling that to dnd kit
            style={style}
        >

            <div className='flex  gap-2 items-center' >
                <div
                    className="touch-none"
                    // for making this div the drag control point
                    {...listeners}
                    // for realiable dragging
                    {...attributes}
                >
                    ::
                </div>
                <button
                    className='border-2 px-0.5 m-1 rounded-sm hover:bg-red-200'
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
                        onChange={() => toggleTask(task.id)}
                    />
                </label>
            </div>
        </div>
    )
}

export default TaskItem