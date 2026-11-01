
// STEP 1: Connect JavaScript to HTML elements

const form = document.getElementById("student-form");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const courseInput = document.getElementById("course");

const studentList = document.getElementById("student-list");
const searchInput = document.getElementById("search");

const courseFilter = document.getElementById("course-filter");

const studentCount = document.getElementById("student-count");
const emptyMessage = document.getElementById("empty-message");

const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");


// STEP 2: Load saved student records

let students = JSON.parse(
    localStorage.getItem("students") || "[]"
);

let editingId = null;


// STEP 3: Save student records

function saveStudents() {
    localStorage.setItem("students", JSON.stringify(students));
}


// STEP 4: Display student records

function displayStudents() {

    const searchText = searchInput.value.toLowerCase();

    
const selectedCourse = courseFilter.value.toLowerCase();

const filteredStudents = students.filter(student => {

    const matchesSearch =
        student.name.toLowerCase().includes(searchText) ||
        student.email.toLowerCase().includes(searchText) ||
        student.course.toLowerCase().includes(searchText);

    const matchesCourse =
        selectedCourse === "" ||
        student.course.toLowerCase() === selectedCourse;

    return matchesSearch && matchesCourse;

});


    studentList.replaceChildren();

    studentCount.textContent = `Total Students: ${students.length}`;
    
// Update dashboard statistics

document.getElementById("total-stat").textContent =
    students.length;

const uniqueCourses = new Set(
    students.map(student => student.course.toLowerCase())
);

document.getElementById("course-stat").textContent =
    uniqueCourses.size;

document.getElementById("latest-stat").textContent =
    students.length > 0
        ? students[students.length - 1].name
        : "None";


    emptyMessage.hidden = filteredStudents.length !== 0;

    filteredStudents.forEach(student => {

        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        const emailCell = document.createElement("td");
        const courseCell = document.createElement("td");
        const actionCell = document.createElement("td");

        nameCell.textContent = student.name;
        emailCell.textContent = student.email;
        courseCell.textContent = student.course;

        // Edit button
        const editButton = document.createElement("button");

        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.dataset.action = "edit";
        editButton.dataset.id = student.id;

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = student.id;

        actionCell.append(editButton, deleteButton);

        row.append(nameCell, emailCell, courseCell, actionCell);

        studentList.appendChild(row);
    });
}


// STEP 5: Reset the form

function resetForm() {

    form.reset();

    editingId = null;

    formTitle.textContent = "Add New Student";

    submitBtn.textContent = "Add Student";

    cancelBtn.hidden = true;
}


// STEP 6: Add or update a student

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const studentData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        course: courseInput.value.trim()
    };

    if (
        !studentData.name ||
        !studentData.email ||
        !studentData.course
    ) {
        return;
    }

    if (editingId !== null) {

        students = students.map(student =>
            student.id === editingId
                ? { ...student, ...studentData }
                : student
        );

    } else {

        students.push({
            id: crypto.randomUUID(),
            ...studentData
        });

    }

    saveStudents();

    resetForm();

    displayStudents();

});


// STEP 7: Edit and delete students

studentList.addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button) return;

    const id = button.dataset.id;

    const action = button.dataset.action;

    const student = students.find(item => item.id === id);

    if (!student) return;


    // Edit student
    if (action === "edit") {

        editingId = id;

        nameInput.value = student.name;

        emailInput.value = student.email;

        courseInput.value = student.course;

        formTitle.textContent = "Edit Student";

        submitBtn.textContent = "Update Student";

        cancelBtn.hidden = false;

        nameInput.focus();

    }


    // Delete student
    if (action === "delete") {

        const confirmed = confirm(
            `Delete ${student.name}?`
        );

        if (!confirmed) return;

        students = students.filter(item => item.id !== id);

        if (editingId === id) {
            resetForm();
        }

        saveStudents();

        displayStudents();

    }

});


// STEP 8: Search students

searchInput.addEventListener("input", displayStudents);
courseFilter.addEventListener("change", displayStudents);


// STEP 9: Cancel editing

cancelBtn.addEventListener("click", resetForm);


// STEP 10: Display saved students when website opens

displayStudents();

// STEP 11: Export student records to CSV

const exportBtn = document.getElementById("export-btn");

exportBtn.addEventListener("click", function () {

    if (students.length === 0) {
        alert("There are no student records to export!");
        return;
    }

    const headers = ["Name", "Email", "Course"];

    // Prepare CSV-safe values
    function csvCell(value) {
        let text = String(value);

        // Protect spreadsheet cells beginning with formulas
        if (/^[=+\-@\t\r]/.test(text)) {
            text = "'" + text;
        }

        return '"' + text.replace(/"/g, '""') + '"';
    }

    const rows = students.map(student => [
        student.name,
        student.email,
        student.course
    ]);

    const csvContent = [
        headers,
        ...rows
    ]
        .map(row => row.map(csvCell).join(","))
        .join("\r\n");

    // Create a downloadable file
    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "student-records.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    alert("Student records downloaded successfully!");

});

