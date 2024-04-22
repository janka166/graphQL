function generateLogin() {
    // Check if a JWT token is present in local storage
    const token = localStorage.getItem("JWToken");
    if (token) {
        navigateTo("/");
    }

    // Clear the body of the document
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }

    // Update the stylesheet
    const styleFile = document.head.getElementsByTagName("link")[0];
    styleFile.href = "./css/loginMenu.css";
    // Create the container element
    const insideLogin = document.createElement("insideLogin");
    insideLogin.className = "insideLogin";
    document.body.append(insideLogin);
    // Create the container element
    const container = document.createElement("div");
    container.className = "container";
    document.body.append(container);

    // Create the title element
    const title = document.createElement("h2");
    title.innerHTML = "Login";

    // Create the login form
    const loginForm = document.createElement("form");
    loginForm.setAttribute("id", "loginForm");
    container.append(title, loginForm);

    // Add an event listener for the form submission
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Get the username and password from the form
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Base64 encode the credentials
        const credentials = btoa(`${username}:${password}`);

        try {
            // Send a POST request to the authentication endpoint
            const response = await fetch("https://01.kood.tech/api/auth/signin", {
                method: "POST",
                headers: {
                    Authorization: `Basic ${credentials}`,
                },
            });

            // Handle the response
            if (response.ok) {
                const data = await response.json();

                // Store the JWT in local storage
                localStorage.setItem("JWToken", data);

                // Redirect to the home page
                navigateTo("/");
            } else {
                // Clear the form inputs
                document.getElementById("username").value = "";
                document.getElementById("password").value = "";

                // Display an error message
                if (response.status === 403) {
                    alert("Incorrect password");
                } else {
                    alert(`User doesn't exist`);
                }
            }
        } catch (error) {
            console.error("An error occurred:", error);

            // Handle other errors (e.g., network issues)
            alert("An error occurred. Please try again later.");
        }
    });

    // Create the form groups
    const formGroups = [
        {
            label: "Username:",
            type: "text",
            id: "username",
            name: "username",
            placeholder: "Enter your username",
            required: true,
        },
        {
            label: "Password:",
            type: "password",
            id: "password",
            name: "password",
            placeholder: "Enter your password",
            required: true,
        },
    ];

    // Append the form groups to the login form
    formGroups.forEach((group) => {
        const formGroup = document.createElement("div");
        formGroup.className = "form-group";

        const label = document.createElement("label");
        label.setAttribute("for", group.id);
        label.innerHTML = group.label;

        const input = document.createElement("input");
        input.setAttribute("type", group.type);
        input.setAttribute("id", group.id);
        input.setAttribute("name", group.name);
        input.setAttribute("placeholder", group.placeholder);
        input.required = group.required;

        formGroup.append(label, input);
        loginForm.append(formGroup);
    });

    // Create the submit button
    const submitBtn = document.createElement("input");
    submitBtn.setAttribute("type", "submit");
    submitBtn.value = "Login";

    // Create the submit form group
    const submitFG = document.createElement("div");
    submitFG.className = "form-group";
    submitFG.appendChild(submitBtn);

    // Append the submit form group to the login form
    loginForm.append(submitFG);
}
async function fetchMainPageContent() {
    const token = localStorage.getItem("JWToken");
    if (token === null || token === undefined) {
        navigateTo("/login");
    }

    try {
        const response = await fetch("https://01.kood.tech/api/graphql-engine/v1/graphql", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: `{
                    user {
                        id
                        login
                        profile
                        attrs
                        totalUp
                        totalDown
                        transactions(order_by: { createdAt: desc }) {
                            id
                            type
                            amount
                            createdAt
                            path
                        }
                    }
                }`,
            }),
        });
        const data = await response.json();
        try {
            const user = data.data.user;
            if (user[0] != null) {
                generateMain(user[0]);
            }
        } catch (error) {
            data.errors.forEach((e) => {
                console.error(e.message);
            });
            console.error("An error occurred:", error);
            generateError("An error occurred. Something wrong with graphQL command");
            localStorage.clear();
        }
    } catch (error) {
        console.log("error2");
        console.error("An error occurred:", error);
        generateError("An error occurred. Please try again later.");
        localStorage.clear();
    }
}

function generateMain(user) {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }

    const styleFile = document.head.getElementsByTagName("link")[0];
    styleFile.href = "./css/indexStyle.css";

    const xps = user.transactions.filter(
        (element) =>
            element.type === "xp" &&
            !element.path.includes("piscine") &&
            !element.path.includes("rust")
    );
    const sum = convertBytesToSize(
        xps.reduce((total, element) => total + element.amount, 0)
    );
    const skills = user.transactions.filter((element) =>
        element.type.includes("skill")
    );
    const insideMain = document.createElement("insideMain");
    insideMain.className = "insideMain";
    document.body.append(insideMain);
    const userInfo = document.createElement("div");
    userInfo.setAttribute("id", "main-student-info-container");
    userInfo.className = "student-info";

    const container = document.createElement("div");
    container.setAttribute("id", "container");

    const studentFirstRowCont = document.createElement("div");
    studentFirstRowCont.setAttribute("id", "first-row");
    studentFirstRowCont.className = "student-info-containers";

    const studentSecondRowCont = document.createElement("div");
    studentSecondRowCont.setAttribute("id", "second-row");
    studentSecondRowCont.className = "student-info-containers";

    const studentThirdRowCont = document.createElement("div");
    studentThirdRowCont.setAttribute("id", "third-row");
    studentThirdRowCont.className = "student-info-containers";

    const skillsCont = document.createElement("div");
    skillsCont.classList.add("chart-container-wrapper");
    skillsCont.classList.add("graph-container");

    const logoutBtn = document.createElement("button");
    logoutBtn.className = "button";
    logoutBtn.addEventListener("click", () => {
        const token = localStorage.getItem("JWToken");
        if (token != null && token != undefined) {
            localStorage.clear();
            navigateTo("/login");
        }
    });

    const userbasic = document.createElement("div");
    userbasic.setAttribute("id", "userbasic");

    const userImgCont = document.createElement("div");
    userImgCont.setAttribute("id", "img-container");

    const userImg = document.createElement("img");
    userImg.setAttribute("src", `${user.attrs.image}`);

    userImgCont.append(userImg);

    const infoCont = document.createElement("div");
    infoCont.setAttribute("id", "main-info-container");

    const usernameSpan = document.createElement("span");
    usernameSpan.innerHTML = `Welcome, ${user.login}`;

    const emailSpan = document.createElement("span");
    emailSpan.className = "lb";
    emailSpan.innerHTML = user.attrs.email;

    infoCont.append(usernameSpan, emailSpan);

    logoutBtn.innerHTML = "log out";

    userbasic.append(userImgCont, infoCont);

    userInfo.append(userbasic, logoutBtn);

    studentFirstRowCont.append(userInfo);

    const studentLevelCont = document.createElement("div");
    studentLevelCont.className = "student-info";
    studentLevelCont.setAttribute("id", "level-container");

    const userLevelLb = document.createElement("span");
    userLevelLb.innerHTML = `Level`;

    const userLevel = document.createElement("div");
    userLevel.setAttribute("id", "level-num-container");

    const levelNum = document.createElement("span");

    const currLevelElement = user.transactions
        .filter(
            (element) =>
                element.type === "level" &&
                !element.path.includes("piscine") &&
                !element.path.includes("rust")
        )
        .reduce((prevElement, currentElement) => {
            return currentElement.amount > prevElement.amount
                ? currentElement
                : prevElement;
        });

    levelNum.innerHTML = `${currLevelElement.amount}`;

    userLevel.appendChild(levelNum);

    studentLevelCont.append(userLevelLb, userLevel);

    const studentXpCont = document.createElement("div");
    studentXpCont.setAttribute("id", "xp-container");
    studentXpCont.className = "student-info";

    const userXPAmount = document.createElement("p");
    userXPAmount.innerHTML = `XP ${sum.amount} ${sum.size}`;

    const graphCont = document.createElement("div");
    graphCont.className = "graph-container";
    graphCont.append(generateXPProgressGraph(xps));

    studentXpCont.append(userXPAmount, graphCont);

    studentSecondRowCont.append(studentLevelCont, studentXpCont);

    const studentAuditsCont = document.createElement("div");
    studentAuditsCont.className = "student-info";
    studentAuditsCont.setAttribute("id", "audit-container");

    const AuditRatioLb = document.createElement("p");
    AuditRatioLb.innerHTML = `Audits score`;

    const userAuditRatio = document.createElement("p");

    const auditR = Math.round((user.totalUp / user.totalDown) * 10) / 10;

    auditR > 0.4
        ? (userAuditRatio.innerHTML = `${auditR} Almost perfect!`)
        : (userAuditRatio.innerHTML = `${auditR} It's almost ...`);

    auditR > 0.4
        ? (userAuditRatio.style.color = "var(--color-red)")
        : (userAuditRatio.style.color = "var(--color-black)");

    const auditGraphCont = document.createElement("div");
    auditGraphCont.style.width = "100%";
    auditGraphCont.append(
        generateAuditRateGraph([
            convertBytesToSize(user.totalUp, "MB").amount,
            convertBytesToSize(user.totalDown, "MB").amount,
        ])
    );

    studentAuditsCont.append(AuditRatioLb, auditGraphCont, userAuditRatio);

    const studentSkillsCont = document.createElement("div");
    studentSkillsCont.className = "student-info";

    const skillSpan = document.createElement("p");
    skillSpan.innerHTML = "Skills";

    skillsCont.append(
        generateTechnicalSkills(skills),
        generateTechnologiesSkills(skills)
    );

    studentSkillsCont.append(skillSpan, skillsCont);

    studentThirdRowCont.append(studentAuditsCont, studentSkillsCont);

    container.append(studentFirstRowCont, studentSecondRowCont, studentThirdRowCont);

    document.body.append(container);
}

function convertBytesToSize(bytes, size) {
    const sizes = ["Bytes", "KB", "MB"];
    if (bytes === 0) {
        return "0 Byte";

    }
    var i = -1;
    size != null ? (i = sizes.indexOf(size)) : (i = Math.floor(Math.log(bytes) / Math.log(1000)));
    const convertedValue = parseFloat((bytes / Math.pow(1000, i)).toFixed(2));
    return {
        amount: convertedValue,
        size: sizes[i],
    };
}

function generateXPProgressGraph(xps) {
    // Use the data to generate SVG graphs and insert them into the appropriate elements on the profile page
    // Implement your SVG graph generation logic here based on the provided data

    const XPprogressChart = document.createElement("canvas");
    XPprogressChart.setAttribute("id", "chart");

    // Extract relevant data from XP entities
    var xpData = xps.map(function (entity) {
        return {
            date: new Date(entity.createdAt), // Convert createdAt to Date object
            xp: entity.amount,
            task: entity.path.split("/")[entity.path.split("/").length - 1],
        };
    });

    // Sort the XP data by date in ascending order
    xpData.sort(function (a, b) {
        return a.date - b.date;
    });

    for (let i = 1; i < xpData.length; i++) {
        xpData[i].xp += xpData[i - 1].xp;
    }

    // Split the data into separate arrays for labels (dates) and data (XP amounts)
    var labels = xpData.map(function (data) {
        return data.date.toLocaleDateString(); // Format date as per your preference
    });
    var data = xpData.map(function (data) {
        return convertBytesToSize(data.xp, "KB").amount;
    });

    var myChart = new Chart(XPprogressChart, {
        type: "line", // Line chart to show progress over time
        data: {
            labels: labels, // X-axis labels (dates)
            datasets: [
                {
                    label: "XP Earned", // Label for the dataset
                    data: data, // Y-axis data (XP amounts)
                    fill: false, // No fill for the line chart
                    borderColor: "rgb(7,108,24)", // Color for the line
                    pointBackgroundColor: "rgb(7,108,24)",
                },
            ],
        },
        options: {
            responsive: true, // Enable responsiveness
            maintainAspectRatio: false,
            aspectRatio: 1,
            scales: {
                y: {
                    beginAtZero: true, // Start the Y-axis at 0
                },
            },
            plugins: {
                legend: {
                    display: false, // Hide the legend
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            var dataIndex = context.dataIndex;
                            var tooltipLabel = data[dataIndex];
                            var taskLabel = xpData[dataIndex].task;
                            return `Amount: ${tooltipLabel}\nTask: ${taskLabel}`;
                        },
                    },
                },
            },
        },
    });

    return XPprogressChart;
}

function generateAuditRateGraph(audits) {
    // Create a canvas element for the chart
    var canvas = document.createElement("canvas");
    canvas.setAttribute("id", "audit-chart");

    // Data for the chart
    var verticalLineData = ["done", "received"];
    verticalLineData.forEach((el, i) => {
        verticalLineData[i] = `${el}: ${audits[i]} MB`;
    });

    // Create the chart
    var horizontalBarChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: verticalLineData,
            datasets: [
                {
                    data: audits,
                    backgroundColor: [
                        "rgb(43,110,8)", // first bar
                        "rgb(164,5,60)", // second bar
                    ],
                },
            ],
        },
        options: {
            indexAxis: "y", // Rotate the chart to horizontal layout
            responsive: true, // Make the chart responsive
            aspectRatio: 4,
            plugins: {
                legend: {
                    display: false, // Hide the legend
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            var dataIndex = context.dataIndex;
                            var value = audits[dataIndex];
                            var label = verticalLineData[dataIndex];
                            return `${value} MB`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    display: false, // Hide the x-axis grid lines
                    beginAtZero: true, // Start the X-axis at 0
                },
                y: {
                    position: "right",
                    grid: {
                        display: false, // Hide the y-axis grid lines
                    },
                },
            },
            datasets: {
                bar: {
                    barThickness: 10, // Adjust the height of the bars
                },
            },
        },
    });

    return canvas;
}

function generateTechnicalSkills(skills) {
    var canvasCont = document.createElement("div");
    canvasCont.className = "chart-container";
    var canvas = document.createElement("canvas");
    canvasCont.appendChild(canvas);

    let technicalSkills = findSkills(skills, [
        "prog",
        "algo",
        "sys-admin",
        "front-end",
        "back-end",
        "stats",
        "game",
    ]);
    generateRadarChart(canvas, technicalSkills);

    let lb = document.createElement("span");
    lb.innerHTML = "Technical skills";
    lb.className = "lb";
    canvasCont.appendChild(lb);

    return canvasCont;
}

function generateTechnologiesSkills(skills) {
    var canvasCont = document.createElement("div");
    canvasCont.className = "chart-container";
    var canvas = document.createElement("canvas");
    canvasCont.appendChild(canvas);

    let technologiesSkills = findSkills(skills, [
        "go",
        "js",
        "html",
        "css",
        "unix",
        "docker",
        "sql",
        "python",
        "graphql",
        "django",
    ]);
    generateRadarChart(canvas, technologiesSkills);

    let lb = document.createElement("span");
    lb.innerHTML = "Technologies skills";
    lb.className = "lb";
    canvasCont.appendChild(lb);

    return canvasCont;
}

function generateRadarChart(container, skills) {
    // Extract entity names and percentages
    var entityLabels = skills.map(function (data) {
        return data.skill;
    });
    var entityPercentages = skills.map(function (data) {
        return data.amount;
    });

    var radarChart = new Chart(container, {
        type: "radar",
        data: {
            labels: entityLabels,
            datasets: [
                {
                    label: "Level 1",
                    data: [0, 100],
                    backgroundColor: "rgba(255, 99, 132, 0)", // transparent color
                    borderColor: "rgba(255, 99, 132, 0)",
                    pointBackgroundColor: "rgba(255, 99, 132, 0)",
                    borderWidth: 0, // Set border width to 0
                },
                {
                    label: "Level 2",
                    data: entityPercentages,
                    backgroundColor: "rgba(43,110,8,0.5)",
                    borderColor: "rgb(229,1,199)",
                    pointBackgroundColor: "rgb(229,1,199)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            var dataIndex = context.dataIndex;
                            return `${skills[dataIndex].skill}: ${skills[dataIndex].amount}%`;
                        },
                    },
                },
            },
            scale: {
                ticks: {
                    beginAtZero: true,
                    max: 100,
                },
            },
        },
    });
}

function findSkills(skills, values) {
    let filteredSkills = skills
        .filter(function (entity) {
            return values.some(function (value) {
                return entity.type.includes(value);
            });
        })
        .map(function (entity) {
            return {
                skill: entity.type.split("_")[entity.type.split("_").length - 1],
                amount: entity.amount,
                task: entity.path.split("/")[entity.path.split("/").length - 1],
            };
        });

    let result = values.map(function (value) {
        let matchingEntities = filteredSkills.filter(function (entity) {
            return entity.skill === value;
        });

        if (matchingEntities.length === 0) {
            return null; // or any other value you want to represent the absence of a matching entity
        }

        let maxAmountEntity = matchingEntities.reduce(function (prevEntity, currentEntity) {
            return currentEntity.amount > prevEntity.amount ? currentEntity : prevEntity;
        });

        return maxAmountEntity;
    }).filter(function (value) {
        return value !== null; // Filter out null values
    });

    return result;
}

function generateError(error) {
    while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
    }

    let errorCont = document.createElement("div");
    errorCont.innerHTML = error;
    document.body.append(errorCont);
}

const navigateTo = (url) => {
    history.pushState(null, null, url);
    router();
};

const router = async () => {
    const routes = [
        {
            path: "/",
            view: fetchMainPageContent,
        },
        {
            path: "/login",
            view: generateLogin,
        },
    ];

    const urlParts = location.pathname.split("/");
    const potentialMatches = routes.map(route => {
        const routeParts = route.path.split("/");
        const isMatch = routeParts.length === urlParts.length &&
            routeParts.every((part, index) => part === urlParts[index] || part.startsWith(":"));
        return {
            route: route,
            isMatch: isMatch,
            params: isMatch ? urlParts.slice(routeParts.length - 1) : [],
        };
    });

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);
    if (!match) {
        match = {
            route: routes[0],
            isMatch: true,
        };
    }

    const param = match.params && match.params.length > 0 ? match.params[0] : null;
    await match.route.view(param);
};
navigateTo('/login');