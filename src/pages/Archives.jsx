

// dnd imports
import {
    SortableContext,
    arrayMove
} from "@dnd-kit/sortable";
import {
    DndContext,
} from "@dnd-kit/core";

// custom hooks and components

import TaskItem from '../components/TaskItem';
import useTasks from '../hooks/useTasks';
import useAuth from '../hooks/useAuth';




function Archives() {

    const { user } = useAuth(); // custom hook created for handling auth



    const {
        tasks,
        dropped,
        deleteTask,
        toggleTask,
        handleDragEnd,
        handleDragStart
    } = useTasks(user, "archives"); // custom hook created to handle all task related logic





    return (

        <>
            <h1 className="text-lg text-gray-600 mt-0.5 font-bold" >Completed Tasks</h1>
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
        </>
    );
}

export default Archives;