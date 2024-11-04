document.getElementById('userLink').addEventListener('click', () => {
    document.getElementById('userSection').style.display = 'block';
    document.getElementById('coursesSection').style.display = 'none';
    loadUsers();
});

document.getElementById('coursesLink').addEventListener('click', () => {
    document.getElementById('userSection').style.display = 'none';
    document.getElementById('coursesSection').style.display = 'block';
    loadCourses();
});

// Helper function to add authorization headers
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Load Users from your local API
async function loadUsers() {
    try {
        const response = await fetch('http://localhost:4000/api/users/all', {
            headers: getAuthHeaders()
        });
        if (response.status === 403) {
            alert("You are not authorized to view users. Please log in.");
            window.location.href = 'login.html';
            return;
        }
        const users = await response.json();
        const userList = document.getElementById('userList');
        userList.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>Name:</strong> ${user.username} <br>
                            <strong>Email:</strong> ${user.email} <br>
                            <strong>Role:</strong> ${user.role}`;
            userList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load and display courses
async function loadCourses() {
    try {
        const response = await fetch('http://localhost:4000/api/courses', {
            headers: getAuthHeaders()
        });
        if (response.status === 403) {
            alert("You are not authorized to view courses. Please log in.");
            window.location.href = './auth.html';
            return;
        }
        const courses = await response.json();
        const courseList = document.getElementById('courseList');
        courseList.innerHTML = '';
        courses.forEach(course => {
            const li = document.createElement('li');
            li.textContent = course.name;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteCourse(course.id);

            const updateButton = document.createElement('button');
            updateButton.textContent = 'Update';
            updateButton.onclick = () => updateCourse(course);

            li.appendChild(deleteButton);
            li.appendChild(updateButton);
            courseList.appendChild(li);
        });
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

// Delete a course by ID
async function deleteCourse(courseId) {
    try {
        await fetch(`http://localhost:4000/api/courses/${courseId}`, { // Updated 'id' to 'courseId'
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        console.log('Course deleted:', courseId);
        loadCourses();
    } catch (error) {
        console.error('Error deleting course:', error);
    }
}


// Update course details
async function updateCourse(course) {
    const newName = prompt("Enter new name for the course", course.name);
    if (newName && newName !== course.name) {
        try {
            const response = await fetch(`http://localhost:4000/api/courses/${course.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({ ...course, name: newName })
            });
            const updatedCourse = await response.json();
            console.log('Course updated:', updatedCourse);
            loadCourses();
        } catch (error) {
            console.error('Error updating course:', error);
        }
    }
}

// Add new course
async function addCourse(event) {
    event.preventDefault();

    const submitButton = event.target.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Adding Course...';
    }

    try {
        const formData = new FormData();
        const courseName = document.getElementById('courseName').value;
        const courseDescription = document.getElementById('courseDescription').value;
        const courseDuration = document.getElementById('courseDuration').value;
        const courseImage = document.getElementById('courseImage').files[0];

        if (!courseName || !courseDescription || !courseDuration) {
            throw new Error('Please fill in all required fields');
        }

        formData.append('name', courseName);
        formData.append('description', courseDescription);
        formData.append('duration', courseDuration);
        if (courseImage) {
            formData.append('picture', courseImage);
        }

        const response = await fetch('http://localhost:4000/api/courses', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                ...getAuthHeaders(),  // Add Authorization header here
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Course added:', data);
        alert('Course successfully added!');
        document.getElementById('courseForm').reset();
        loadCourses();
    } catch (error) {
        console.error('Error adding course:', error);
        alert(`Failed to add course: ${error.message}`);
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Add Course';
        }
    }
}





// Search for courses
function searchCourse() {
    const searchQuery = document.getElementById('searchBar').value.toLowerCase();
    const courses = document.querySelectorAll('#courseList li');
    courses.forEach(course => {
        const courseName = course.textContent.toLowerCase();
        course.style.display = courseName.includes(searchQuery) ? '' : 'none';
    });
}

// Toggle form visibility for adding new courses
function toggleCourseForm() {
    const formContainer = document.getElementById('courseFormContainer');
    formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
}

// Store token for authorization
function storeToken(token) {
    localStorage.setItem('token', token);
}

// Logout functionality
function logout() {
    alert("Logging out...");
    localStorage.removeItem('token');
    window.location.href = 'auth.html';
}

document.addEventListener('DOMContentLoaded', loadCourses);
