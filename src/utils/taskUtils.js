import { LexoRank } from "lexorank";
import { getColletionCount } from "../services/firebaseService"
export const LAZY_TASKS = 8;

export function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function validateInput(input, tasks) {
    if (input.trim() === "") {
        return { success: false, message: "Empty Task" }
    } // .some() -> array method which returns true if at least one elemnet satisfies the condition 
    else if (tasks.some((task) => task.title.toLowerCase().trim() === input.toLowerCase().trim())) {
        return { success: false, message: "Duplicate task" }
    } else {
        return { success: true }
    }
}

export function createNewTask(input, nextIndex) {
    // creating unique id
    const id =
        Date.now().toString() +
        Math.random().toString(16).slice(2);

    // new task object
    const newTask = {
        id,
        title: input,
        status: false,
        index: nextIndex,
        completedDate: null
    };

    return newTask;

}

export async function prepareTasksAndMaintenance(querySnapshot, collectionName, pageCache, pageForward) {

    if (collectionName === "tasks") {
        // const todayDate = getTodayDate(); // today's date -> ${year}-${month}-${day} 
        const todayDate = "2026-09-10";


        const loadedTasks = querySnapshot.docs.map(docSnap => docSnap.data());
        const expiredTasks = loadedTasks.filter(task => task.status && task.completedDate !== todayDate);
        const activeTasks = loadedTasks.filter(task => !expiredTasks.includes(task));

        return {
            activeTasks,
            pendingMaintenance: { expiredTasks },
            updatedPageCache: []
        };
    } else {



        const fetchedTasks = querySnapshot.docs.map(docSnap => docSnap.data());
        const hasNextPage = fetchedTasks.length === LAZY_TASKS + 1;

        let activeTasks;
        let newPageCache;

        // FORWARD
        if (pageForward === 2) {
            activeTasks = fetchedTasks.slice(0, LAZY_TASKS);

            newPageCache = {
                tasks: activeTasks,
                first: querySnapshot.docs[0],
                last: querySnapshot.docs[LAZY_TASKS - 1],
                firstPage: false,
                lastPage: !hasNextPage,
                page: pageCache[pageCache.length - 1].page + 1
            };
        }// BACKWARD
        else if (pageForward === 1) {
            activeTasks = fetchedTasks.slice(0, LAZY_TASKS);

            if (hasNextPage) {
                newPageCache = {
                    tasks: activeTasks,
                    first: querySnapshot.docs[0],
                    last: querySnapshot.docs[LAZY_TASKS - 1],
                    firstPage: true,
                    lastPage: false,
                    page: 1
                };
            } else {
                newPageCache = null;
            }
        }

        const alreadyCached = newPageCache && pageCache.some(p => p.page === newPageCache.page);

        const updatedPageCache = alreadyCached ? pageCache : newPageCache ? [...pageCache, newPageCache] : pageCache;

        return {
            activeTasks,
            pendingMaintenance: null,
            updatedPageCache
        };
    }
}




export function calculateDragIndex(reorderedTasks, targetIndex) {
    const prevTask = reorderedTasks[targetIndex - 1];
    const nextTask = reorderedTasks[targetIndex + 1];

    if (!prevTask && !nextTask) return LexoRank.middle().toString();
    if (!prevTask) return LexoRank.parse(nextTask.index).genPrev().toString();
    if (!nextTask) return LexoRank.parse(prevTask.index).genNext().toString();

    return LexoRank.parse(prevTask.index)
        .between(LexoRank.parse(nextTask.index))
        .toString();
}
