import { useState } from "react";
import * as firebaseService from "../services/firebaseService";
import * as utils from "../utils/taskUtils";

import { arrayMove } from "@dnd-kit/sortable";


export default function useDragAndDrop(uid, tasks, setTasks) {



    async function handleDragEnd(event) {

        if (!event.over || event.active.id === event.over.id) {

            return;
            // handling the case of dropped at the same position and dropping
            // below the last element
        }

        // LOCAL UI UPDATE
        // index from where we dragged the task
        const dragIndex = tasks.findIndex(task => task.id === event.active.id);
        // index to where we dragged the task
        const dropIndex = tasks.findIndex(task => task.id === event.over.id);
        // reordering the array according to drag and drop 
        const reordered = arrayMove(tasks, dragIndex, dropIndex);
        // Calculating the new index for dragged task only
        const calculatedIndex = utils.calculateDragIndex(reordered, dropIndex);
        // asign that new index to dragged task in reordered array
        reordered[dropIndex].index = calculatedIndex;

        setTasks(reordered);

        // DB SYNC - only ONE document
        try {
            await firebaseService.updateTaskFieldsDoc(
                uid,
                "tasks",
                reordered[dropIndex].id,
                { index: calculatedIndex }
            );
        } catch (err) {
            console.log("DRAG SYNC ERROR:", err);
        }

    }

    function handleDragStart() {

    }


    return { handleDragEnd, handleDragStart }
}
