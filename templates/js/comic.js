function toggleMenu() {
    document.querySelector('.menu').classList.toggle('increase');
}

function showAccountProfile() {
    document.querySelector('.account-profile').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
}

function hideAccountProfile() {
    document.querySelector('.account-profile').style.display = 'none';
    document.querySelector('.overlay').style.display = 'none';
}

function loadComics() {
    const booksDiv = document.querySelector('.available');
    const comicDomainSelect = document.querySelector('.comicdomain');

    const fetchComics = (domain) => {
        fetch(`https://grandhalayam.vercel.app/comic?domain=${domain}`)
            .then(response => response.ok ? response.json() : Promise.reject('Error fetching comics'))
            .then(data => renderComics(data))
            .catch(error => {
                console.error(error);
                booksDiv.innerHTML = '<p>Error fetching comics. Please try again later.</p>';
            });
    };

    const renderComics = (data) => {
        booksDiv.innerHTML = data.map(book => createBookElement(book)).join('');
        attachBorrowButtonEvents();
    };

    const createBookElement = (book) => {
        const imageUrl = book.image && book.image.data && book.image.contentType ? 
            `data:${book.image.contentType};base64,${book.image.data}` : 'placeholder.jpg';

        return `
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
                    <li style="cursor:pointer; font-family: Montserrat, sans-serif; font-weight: 500;" 
                        class="borrow-button" data-id="${book._id}">
                        <button class="borrow-btn">${book.status === 'taken' ? 'Return' : 'Borrow'}</button>
                    </li>
                </ul>
            </div>
        `;
    };

    const attachBorrowButtonEvents = () => {
        document.querySelectorAll('.borrow-btn').forEach(button => {
            button.addEventListener('click', handleBorrowButtonClick);
        });
    };

    const handleBorrowButtonClick = (event) => {
        const buttonElement = event.target;
        const bookElement = buttonElement.closest('.borrow-button');
        const bookId = bookElement.getAttribute('data-id');
        const currentStatus = buttonElement.innerText.toLowerCase() === 'borrow' ? 'available' : 'taken';
        const newStatus = currentStatus === 'available' ? 'taken' : 'available';

        fetch(`https://grandhalayam.vercel.app/comic/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error(data.error);
            } else {
                updateButtonAndStatus(buttonElement, bookElement, newStatus);
            }
        })
        .catch(error => {
            console.error('Error updating book status:', error);
        });
    };

    const updateButtonAndStatus = (buttonElement, bookElement, newStatus) => {
        buttonElement.innerText = newStatus === 'taken' ? 'Return' : 'Borrow';
        buttonElement.style.backgroundColor = newStatus === 'taken' ? 'red' : '';
        bookElement.previousElementSibling.querySelector('li:nth-child(5)').innerText = `Status: ${newStatus}`;
    };

    // Event listener for book domain selection change
    comicDomainSelect.addEventListener('change', () => {
        const selectedDomain = comicDomainSelect.value;
        console.log("Selected domain:", selectedDomain);
        fetchComics(selectedDomain);
    });

    // Initial fetch of books based on initial domain selection
    const initialDomain = comicDomainSelect.value;
    fetchComics(initialDomain);
}

// Function to fetch user details and update the profile
const fetchUserProfile = () => {
    fetch('https://grandhalayam.vercel.app/user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('name').textContent = data.name || 'N/A';
        document.getElementById('phone').textContent = data.phone || 'N/A';
        document.getElementById('email').textContent = data.email || 'N/A';
        document.getElementById('role').textContent = data.name === "Admin" ? "Admin" : "Student" || 'N/A';
    })
    .catch(error => {
        console.error('Error fetching user details:', error);
    });
};

// Function to logout
function logout() {
    fetch('https://grandhalayam.vercel.app/logout', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: "false" })
    })
    .then(response => {
        if (response.ok) {
            console.log("Logged out successfully");
            window.location.href = "../login.html"; // Update this URL if needed
        } else {
            console.error("Logout failed");
        }
    })
    .catch(error => {
        console.error("Error during logout:", error);
    });
}

// Call fetchUserProfile and loadComics when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchUserProfile();
    loadComics();
});
