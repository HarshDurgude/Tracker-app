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

export function createNewTask(input, taskLength) {
    // creating unique id
    const id =
        Date.now().toString() +
        Math.random().toString(16).slice(2);

    // new task object
    const newTask = {
        id,
        title: input,
        status: false,
        index: taskLength,
        completedDate: null
    };

    return newTask;

}

export function prepareTasksAndMaintenance(querySnapshot) {
    const todayDate = getTodayDate(); // today's date -> ${year}-${month}-${day}
    // const todayDate = "2026-08-31";


    let indexMismatch = false;

    const loadedTasks = querySnapshot.docs.map((docSnap, ind) => {
        const task = docSnap.data();
        if (task.index !== ind) {
            indexMismatch = true; // if index Mismatch is occured then that means last syncTaskOrderFirebase()
            // didnt perform properly
        }
        return { ...task, index: ind }
    });


    const expiredTasks = loadedTasks.filter(task => task.status && task.completedDate !== todayDate);


    const activeTasks = loadedTasks
        .filter(task => !expiredTasks.includes(task))
        .map((task, index) => ({
            ...task,
            index
        }));

    return {
        activeTasks, pendingMaintenance: {
            expiredTasks,
            needsIndexSync: indexMismatch
        }
    };
}

