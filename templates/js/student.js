// Toggles the menu's expanded view
function tog() {
    const menu_bar = document.querySelector('.menu');
    menu_bar.classList.toggle('increase');
}

// Opens account profile with overlay
function toggled() {
    document.querySelector('.account-profile').classList.add('visible');
    document.querySelector('.overlay').classList.add('visible');
}

// Closes account profile with overlay
function closed() {
    document.querySelector('.account-profile').classList.remove('visible');
    document.querySelector('.overlay').classList.remove('visible');
}

// Function to fetch books based on selected domain
function books() {
    const booksDiv = document.querySelector('.available');
    const bookdomain = document.querySelector('.book-domain');

    // Helper function to get API URL
    const getApiUrl = (path) => `${window.location.origin}${path}`;

    const fetchBooks = (domain) => {
        fetch(getApiUrl(`/book?domain=${domain}`))
            .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
            .then(data => {
                booksDiv.innerHTML = '';
                data.forEach(book => booksDiv.appendChild(createBookElement(book)));
                addBorrowButtonEvents();
            })
            .catch(error => {
                console.error('Error fetching books:', error);
                booksDiv.innerHTML = '<p>Error fetching books. Please try again later.</p>';
            });
    };

    // Helper function to create book HTML element
    const createBookElement = (book) => {
        const bookElement = document.createElement('div');
        const imageUrl = book.image && book.image.data && book.image.contentType ? 
            `data:${book.image.contentType};base64,${book.image.data}` : 
            'placeholder.jpg';

        bookElement.innerHTML = `
            <div class="data">
                <img src="${imageUrl}" alt="${book.name}" style="width: 100px; height: auto;">
                <ul class="ul-one">
                    <li><h3>${book.name}</h3></li>
                    <hr>
                    <li>Author: ${book.author}</li>
                    <hr>
                    <li>Price: ${book.price}</li>
                </ul>
                <ul class="ul-two">
                    <li style="font-size:12px;">Description: ${book.desc}</li>
                    <hr>
                    <li>Status: ${book.status}</li>
                    <li class="borrow-button" data-id="${book._id}">
                        <button class="borrow-btn">${book.status === 'taken' ? 'Return' : 'Borrow'}</button>
                    </li>
                </ul>
            </div>
        `;
        return bookElement;
    };

    // Event listener to change borrow button status
    const addBorrowButtonEvents = () => {
        document.querySelectorAll('.borrow-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const bookElement = event.target.closest('.borrow-button');
                const bookId = bookElement.getAttribute('data-id');
                const currentStatus = event.target.innerText.toLowerCase() === 'borrow' ? 'available' : 'taken';
                const newStatus = currentStatus === 'available' ? 'taken' : 'available';

                fetch(getApiUrl(`/books/${bookId}`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                })
                .then(response => response.ok ? response.json() : Promise.reject('Error updating book status'))
                .then(data => {
                    event.target.innerText = newStatus === 'taken' ? 'Return' : 'Borrow';
                    bookElement.previousElementSibling.querySelector('li:nth-child(5)').innerText = `Status: ${newStatus}`;
                })
                .catch(error => console.error('Error updating book status:', error));
            });
        });
    };

    bookdomain.addEventListener('change', () => fetchBooks(bookdomain.value));
    fetchBooks(bookdomain.value);
}

// Fetches user profile data on load
const fetchUserProfile = () => {
    fetch(`${window.location.origin}/user`)
        .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch user data'))
        .then(data => {
            document.getElementById('name').textContent = data.name || 'N/A';
            document.getElementById('phone').textContent = data.phone || 'N/A';
            document.getElementById('email').textContent = data.email || 'N/A';
            document.getElementById('role').textContent = data.email === "varunbotcha@gmail.com" ? "Admin" : "Student";
        })
        .catch(error => console.error('Error fetching user details:', error));
};

// Function to handle user logout
function logout() {
    fetch(`${window.location.origin}/logout`, { method: 'PUT' })
        .then(response => {
            if (response.ok) {
                console.log("Logout successful, redirecting to index.html");
                window.location.href = "../login.html";
            } else {
                console.error("Logout failed:", response.status);
            }
        })
        .catch(error => console.error("Error during logout:", error));
}

// Initial call to fetch user profile and available books on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchUserProfile();
    books();
});
