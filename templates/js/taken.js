document.addEventListener('DOMContentLoaded', () => {
    // Load the initially selected category
    change();
});

document.querySelector('.book-domain').addEventListener('change', change);

function change() {
   const val = document.querySelector('.book-domain').value;
   if (val === "Books") {
       fetchData('takenbooks', '.note');
   } else if (val === "Magazine") {
       fetchData('takenmagazine', '.mag');
   } else if (val === "Comics") {
       fetchData('takencomic', '.com');
   }
}

function fetchData(endpoint, selector) {
    const note = document.querySelector('.note');
    const mag = document.querySelector('.mag');
    const com = document.querySelector('.com');

    note.style.display = selector === '.note' ? 'block' : 'none';
    mag.style.display = selector === '.mag' ? 'block' : 'none';
    com.style.display = selector === '.com' ? 'block' : 'none';

    fetch(`https://grandhalayam.vercel.app/${endpoint}`)
        .then(response => response.json())
        .then(data => {
            const booksDiv = document.querySelector(selector);
            booksDiv.innerHTML = '';
            data.forEach(book => {
                const bookElement = createBookElement(book);
                booksDiv.appendChild(bookElement);
            });
            addBorrowButtonEvents(selector);
        })
        .catch(error => {
            console.error(`Error fetching ${endpoint}:`, error);
        });
}

const createBookElement = (book) => {
    const bookElement = document.createElement('div');
    const imageUrl = book.image && book.image.data && book.image.contentType ? 
        `data:${book.image.contentType};base64,${book.image.data}` : 
        'placeholder.jpg';
    const dueDate = new Date(book.date);
    dueDate.setDate(dueDate.getDate() + 5);
    const formattedDueDate = dueDate.toDateString();
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
                <li style="color:red;">Due Date: ${formattedDueDate}</li>
                <li style="color:#000; cursor:pointer; font-family: Montserrat, sans-serif; font-weight: 500;" class="borrow-button" data-id="${book._id}">
                  <button class="borrow-btn">${book.status === 'taken' ? 'Return' : 'Borrow'}</button>
                </li>
            </ul>
        </div>
    `;
    return bookElement;
};

const addBorrowButtonEvents = (selector) => {
    const borrowButtons = document.querySelectorAll(`${selector} .borrow-btn`);
    borrowButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const buttonElement = event.target;
            const bookElement = buttonElement.closest('.borrow-button');
            const bookId = bookElement.getAttribute('data-id');
            const currentStatus = buttonElement.innerText.toLowerCase() === 'borrow' ? 'available' : 'taken';
            const newStatus = currentStatus === 'available' ? 'taken' : 'available';

            fetch(`https://grandhalayam.vercel.app/books/${bookId}`, {
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
                    buttonElement.innerText = newStatus === 'taken' ? 'Return' : 'Borrow';
                    buttonElement.style.backgroundColor = newStatus === 'taken' ? 'red' : '';
                    bookElement.previousElementSibling.querySelector('li:nth-child(5)').innerText = `Status: ${newStatus}`;
                }
            })
            .catch(error => {
                console.error('Error updating book status:', error);
            });
        });
    });
};
