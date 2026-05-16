
// backend simulation
export function fakeSaveTask(task) {

    console.log("SERVER: request received");

    return new Promise((resolve, reject) => {

        console.log("SERVER: processing request...");

        setTimeout(() => {

            console.log("SERVER: task saved");

            const randomFail = "network issue";
            // const randomFail = 0;

            if (randomFail) {

                reject(randomFail);

            } else {

                resolve({
                    success: true
                });
            }

        }, 2000);

    });

}