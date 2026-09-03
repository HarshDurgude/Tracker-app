import { LexoRank } from "lexorank";

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

export function prepareTasksAndMaintenance(querySnapshot) {
    const todayDate = getTodayDate(); // today's date -> ${year}-${month}-${day}
    // const todayDate = "2026-09-06";

    const loadedTasks = querySnapshot.docs.map((docSnap) => docSnap.data());

    const expiredTasks = loadedTasks.filter(task => task.status && task.completedDate !== todayDate);

    const activeTasks = loadedTasks.filter(task => !expiredTasks.includes(task));

    return {
        activeTasks, pendingMaintenance: {
            expiredTasks
        }
    };
}


export function getNextRank(tasks) {
    if (!tasks || tasks.length === 0) return LexoRank.middle().toString();
    const lastTask = tasks[tasks.length - 1];
    return LexoRank.parse(lastTask.index).genNext().toString();
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

export function getNextRankFromRank(lastRank) {

    if (!lastRank) {
        return LexoRank.middle().toString();
    }

    return LexoRank
        .parse(lastRank)
        .genNext()
        .toString();
}